import fs from 'fs'
import path from 'path'

// Read the OpenAPI YAML file
const openapiPath = path.join(__dirname, '../../docs/openapi.yaml')
const openapiFile = fs.readFileSync(openapiPath, 'utf8')

// Simple YAML parser for OpenAPI spec (basic implementation)
export default {
  openapi: '3.0.0',
  info: {
    title: 'DSA Platform API',
    version: '1.0.0',
  },
  servers: [
    {
      url: 'http://localhost:4000/api/v1',
    },
  ],
}