import type { App } from 'vue'
import './style.css'
import NewDialog from './components/NewDialog.vue'
import NewDrawer from './components/NewDrawer.vue'

const components = [NewDialog, NewDrawer]

const install = (app: App) => {
  components.forEach(component => app.component(component.__name ?? component.name!, component))
}

export default install
export { NewDialog, NewDrawer }
export { openDialog, openDrawer, useDialog } from './open-dialog'
export { DialogCancelledError } from './types'
export type { DialogAction, DialogKind } from './types'
