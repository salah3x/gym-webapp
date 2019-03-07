import * as express from 'express';
import * as bodyParser from 'body-parser';

export const app: express.Application = express();
function isSuperAdminMiddleware(request: express.Request,
                                response: express.Response,
                                next: express.NextFunction) {
    // todo: verify if the current user has superAdmin claim, if not return 403 error.
    next();
}
app.use(isSuperAdminMiddleware);
app.use(bodyParser.json());
const route: express.Router = express.Router()

route.get('/hello', (req: express.Request, res: express.Response) => {
    res.json({message: 'Hello World!'})
})

app.use('/api/superAdmin', route);
