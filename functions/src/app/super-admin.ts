import * as express from 'express';

export const app: express.Application = express();

function isSuperAdminMiddleware(request: express.Request,
                                response: express.Response,
                                next: express.NextFunction) {
    // todo: verify if the current user has superAdmin claim, if not return 403 error.
    next();
}

app.use(isSuperAdminMiddleware);

app.get('/hello', (req: express.Request, res: express.Response) => {
    res.json({message: 'Hello World!'})
})
