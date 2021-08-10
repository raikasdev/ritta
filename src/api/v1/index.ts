import auth from './auth';
import user from './user';
import info from './info';

export default (app, _opts, done) => {
  app.register(user, { prefix: '/user' });
  app.register(auth, { prefix: '/auth' });
  app.register(info, { prefix: '/info' });

  app.setErrorHandler((err, _req, res) => {
    let errorMessage = err.message;
    switch (err.name) {
      case 'TokenExpiredError':
        errorMessage = 'The JWT has expired';
        break;
      case 'NotBeforeError':
      case 'JsonWebTokenError':
        errorMessage = 'The JWT is invalid';
        break;
    }
    return res.status(400).send({
      message: errorMessage,
    });
  });
  done();
};
