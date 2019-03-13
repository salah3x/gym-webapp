import * as express from 'express';
import * as cors from 'cors';
import * as admin from 'firebase-admin'

// Initialize an express app
export const app: express.Application = express();
// Add cors configuration
const corsOptions = {
    origin: 'http://localhost:4200'
}
app.use(cors(corsOptions));
// Add a middleware to verify caller permissions (expect caller token in request's body)
async function isSuperAdminMiddleware(req: express.Request,
                                    res: express.Response,
                                    next: express.NextFunction) {
    const token = req.body.token;
    if (!token) {
        res.status(400).send({"error": "Bad request", "message": "Token must not be null"});
        return;
    }
    let claims;
    try {
        claims = await admin.auth().verifyIdToken(token);
    } catch(err) {
        res.status(401).send({"error": "Forbidden", "message": "Token rejected"});
        return;
    }
    if (!claims || !claims.superadmin) {
        res.status(403).send({"error": "Unauthorized", "message": "You do not have required permission"});;
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
        res.status(400).send({"error": "Bad request", "message": "Email and claims must not be null"})
        return
    }
    let user: admin.auth.UserRecord;
    try {
        user = await admin.auth().getUserByEmail(email);
    } catch (err) {
        res.status(500).send({"error": "Internal error", "message": "Retrieving user by email failed"})
        return;
    }
    return admin.auth().setCustomUserClaims(user.uid, claims)
                .then(() => {
                    res.status(202).send({"message": `Claims have been set to ${email} successfully`});
                })
                .catch(() => {
                    res.status(500).send({"error": "Internal error", "message": `Setting claims to ${email} failed`});
                });
});
route.post('/users', (req: express.Request, res: express.Response) => {
    return admin.auth().listUsers()
                .then(users => res.json(users.users.map(user => {
                        return {'email': user.email, 'claims': user.customClaims}
                    })))
                .catch(() => res.status(500).send({"error": "Internal error", "message": `Retrieving users failed`}))
});
app.use('/api/superadmin', route);
