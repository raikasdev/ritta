import config from '../../../config';
import { StrategyStore } from '../../../store';

export default (router, _opts, done) => {
  router.post('/', async (_, res) => {
    const data = Array.from(StrategyStore.get()).map(
      ({ name, image, showInLogin, bypassMFA }) => {
        return {
          name,
          image,
          showInLogin,
          bypassMFA,
          startURL: `${config.backUrl}/v1/auth/${name}/start`,
          callbackURL: `${config.backUrl}/v1/auth/${name}/callback`,
        };
      }
    );
    return res.status(200).send(data);
  });
  done();
};
