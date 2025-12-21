import Resolver from '@forge/resolver';

const resolver = new Resolver();

resolver.define('getDashboardData', async () => {
  return ({'Hello World from the backend!': true});
});

export const handler = resolver.getDefinitions();
