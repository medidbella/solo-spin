import Fastify from 'fastify';

const fastify = Fastify({ 
  logger: true 
});

fastify.get('/working', async () => { //ghir bach ntesti 
  return { message: 'yes' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 4000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();