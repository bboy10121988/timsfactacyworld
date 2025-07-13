import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import { schemaTypes } from './schemas'

export default defineConfig({
  name: 'default', 
  title: 'Medusa CMS',

  projectId: 'm7o2mv1n',
  dataset: 'production',

  basePath: '/cms',

  plugins: [
    structureTool(),
    visionTool()
  ],

  schema: {
    types: schemaTypes,
  },
})
