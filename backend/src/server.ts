import { AppDataSource } from './data-source';
import { createApp } from './app';
import { initSubscribers } from './shared/events/initSubscribers';

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    console.log('Base de datos conectada');
    initSubscribers();
    const app = createApp();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error('Error al conectar la DB', err));
