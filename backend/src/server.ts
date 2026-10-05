import { AppDataSource } from './data-source';
import { createApp } from './app';

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    console.log('Base de datos conectada');
    const app = createApp();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error('Error al conectar la DB', err));

//USA APP PARA PRENDER EL SERVIDOR EN UN PUERTO