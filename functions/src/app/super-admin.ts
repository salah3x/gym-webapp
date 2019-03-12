import * as express from 'express';
import * as admin from 'firebase-admin'

// Initialize an express app
export const app: express.Application = express();
// Add a middleware to verify caller permissions (expect caller uid in request's body)
async function isSuperAdminMiddleware(req: express.Request,
                                    res: express.Response,
                                    next: express.NextFunction) {
    const uid = req.body.uid;
    if (!uid) {
        res.status(401);
        return;
    }
    const claims = await admin.auth().verifyIdToken(uid);
    if (!claims || !claims.superadmin) {
        res.sendStatus(403);
        return;
    }
    next();
}
app.use(isSuperAdminMiddleware);
// Create an express Router and define the endpoints
const route: express.Router = express.Router()
route.post('/updateClaims', async (req: express.Request, res: express.Response) => {
    const email = req.body.email;
    const claims = req.body.claims;
    if (!email || !claims) {
        res.status(400).send('email and claims must not be null.')
    }
    const user = await admin.auth().getUserByEmail(email);
    return admin.auth().setCustomUserClaims(user.uid, claims)
                .then(() => {
                    console.log(`Setting claims to ${email}: `, claims)
                    res.sendStatus(201);
                })
                .catch((error) => {
                    console.error(`Setting claims to ${email} failed: `, error);
                    res.sendStatus(500);
                });
});
app.use('/api/superadmin', route);
