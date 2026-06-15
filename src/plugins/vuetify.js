import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { indigo } from 'vuetify/util/colors'

export default createVuetify({
  components,
  directives,
  defaults: {
    VExpansionPanels: {
      elevation: 0,
      flat: true,
    },
    VExpansionPanel: {
      elevation: 0,
    },
  },
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        colors: {
          primary: indigo.base,
          'primary-darken-1': indigo.darken1,
        },
      },
    },
  },
})
