import { boot } from 'quasar/wrappers';
import { UDIToolkit } from 'udi-toolkit';
import 'udi-toolkit/dist/index.css';

export default boot(async ({ app }) => {
  app.use(UDIToolkit);
});
