import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import YAML from 'yaml'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Read the OpenAPI YAML file
const openapiPath = path.join(__dirname, '../../docs/openapi.yaml')
const openapiFile = fs.readFileSync(openapiPath, 'utf8')
const openapiSpec = YAML.parse(openapiFile)

export default openapiSpec
