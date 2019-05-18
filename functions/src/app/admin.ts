import * as express from 'express';
import * as cors from 'cors';
import * as admin from 'firebase-admin';

// Initialize an express app
export const app: express.Application = express();
// Add cors configuration
const corsOptions = {
  origin: 'http://localhost:4200'
};
app.use(cors(corsOptions));
// Add a middleware to verify caller permissions (expect caller token in request's body)
async function isAdminMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const token = req.body.token;
  if (!token) {
    res
      .status(400)
      .send({ error: 'Bad Request', message: 'Token must not be null' });
    return;
  }
  let claims;
  try {
    claims = await admin.auth().verifyIdToken(token);
  } catch (err) {
    res.status(401).send({ error: 'Forbidden', message: 'Token rejected' });
    return;
  }
  if (!claims || !claims.admin) {
    res.status(403).send({
      error: 'Unauthorized',
      message: 'You do not have required permission'
    });
    return;
  }
  next();
}
app.use(isAdminMiddleware);
// Create an express Router and define the endpoints
const route: express.Router = express.Router();
/**
 * POST: /api/admin/deleteSubscription
 * Delete a subscription along with its members and their associated data:
 * - The 'checkins' subcollection
 * - The photo from cloud storage
 * Expects the body to contain:
 * - idPack: string
 * - idSubscription: string
 */
route.post(
  '/deleteSubscription',
  async (req: express.Request, res: express.Response) => {
    const idPack: string = req.body.idPack;
    const idSubscription: string = req.body.idSubscription;
    if (!idPack || !idSubscription) {
      res.status(400).send({
        error: 'Bad Request',
        message: 'Please send correct info'
      });
      return;
    }
    const db = admin.firestore();
    return db
      .runTransaction(async t => {
        const clients: admin.firestore.QuerySnapshot = await t.get(
          db
            .collection(`clients`)
            .where('pack.idPack', '==', idPack)
            .where('pack.idSubscription', '==', idSubscription)
        );
        const checkins: admin.firestore.QuerySnapshot[] = [];
        for (const client of clients.docs) {
          checkins.push(
            await t.get(db.collection(`clients/${client.id}/checkins`))
          );
        }
        checkins.forEach(q => q.forEach(c => t.delete(c.ref)));
        clients.forEach(async c => {
          t.delete(c.ref);
          if (c.data().photo) {
            await admin
              .storage()
              .bucket()
              .file(c.data().photo)
              .delete();
          }
        });
        t.delete(db.doc(`packs/${idPack}/subscriptions/${idSubscription}`));
      })
      .then(() => res.status(200).send({ message: 'Subscription deleted' }))
      .catch(err =>
        res.status(500).send({
          error: 'Internal Error',
          message: 'Failed to delete subscription',
          details: err
        })
      );
  }
);
/**
 * POST: /api/admin/deleteClient
 * Delete the client and its associated data:
 * - The photo from cloud storage
 * - The 'checkins' subcollection
 * - The client id from the subscription document (or the hole document if there is only one subscriber)
 * Expects the body to contain:
 * - id: string (The client id)
 */
route.post('/deleteClient', (req: express.Request, res: express.Response) => {
  const id: string = req.body.id;
  if (!id) {
    res.status(400).send({
      error: 'Bad Request',
      message: "Client's id not provided"
    });
    return;
  }
  const db = admin.firestore();
  return db
    .runTransaction(async t => {
      const clientDoc = await t.get(db.doc(`clients/${id}`));
      const clientData = clientDoc.data();
      if (!clientData) {
        return Promise.reject('Client not found');
      }
      const subscriptionDoc = await t.get(
        db.doc(
          `packs/${clientData.pack.idPack}/subscriptions/${
            clientData.pack.idSubscription
          }`
        )
      );
      const subscriptionData = subscriptionDoc.data();
      if (
        !subscriptionData ||
        !subscriptionData.subscriberIds ||
        !subscriptionData.subscriberIds.length
      ) {
        return Promise.reject(
          "Subscription not found or doesn't contain any subscribers"
        );
      }
      const checkins = await t.get(db.collection(`clients/${id}/checkins`));
      if (clientData.photo) {
        try {
          await admin
            .storage()
            .bucket()
            .file(clientData.photo)
            .delete();
        } catch (error) {
          return Promise.reject('Failed to delete photo');
        }
      }
      if (subscriptionData.subscriberIds.length === 1) {
        t.delete(subscriptionDoc.ref);
      } else {
        t.update(subscriptionDoc.ref, {
          subscriberIds: subscriptionData.subscriberIds.filter(
            (i: string) => i !== id
          )
        });
      }
      checkins.forEach(c => t.delete(c.ref));
      t.delete(clientDoc.ref);
      return Promise.resolve();
    })
    .then(() => res.status(200).send({ message: 'Client deleted' }))
    .catch(err =>
      res.status(500).send({
        error: 'Internal Error',
        message: 'Failed to delete client',
        details: err
      })
    );
});
app.use('/api/admin', route);
