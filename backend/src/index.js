const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 4000

// Serve static frontend in production
const publicPath = path.join(__dirname, '..', 'public')
app.use(express.static(publicPath))

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.get('/api/lessons', (req, res) => {
  res.json({
    lessons: [
      { id: 1, title: 'Arrays', difficulty: 'Easy' },
      { id: 2, title: 'Linked Lists', difficulty: 'Medium' }
    ]
  })
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal Server Error' })
})

// Catch-all for SPA: serve index.html for non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'))
})

app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`))
