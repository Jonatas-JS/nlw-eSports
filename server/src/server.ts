import express from 'express'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient({ // fará a conexão com o BD automaticamente
  log: ['query']
})

// HTTP mehods / API RESTful / HTTP Codes
// GET, POST, PUT, PATCH, DELETE
/*
  -- Query Params: localhost:333/ads?page=2 persistir estado, filtros, ordenação, sem são nomeados
  -- Route Params: localhost:333/ads/como-criar-uma-api-em-node parâmtros não nomeados
  -- Body Params: enviar várias informações ex: formulários. Obs.: não fica visível na URL
*/

// async/await

app.get('/games', async (request, response) => {
  const games = await prisma.game.findMany({ // await => vai aguardar essa função executar para então proceguir com a próxima.
    include: {
      _count: {
        select: {
          Ad: true,
        }
      }
    }
  })
  
  return response.json(games);
});

app.post('/ads', (request, response) => {
  return response.status(201).json([]);
});

app.get('/games/:id/ads', async (request, response) => {
  const gameId = request.params.id;

  const ads = await prisma.ad.findMany({
    select: {
      id: true,
      name: true,
      weekDays: true,
      useVoiceChannel: true,
      yearsPlaying: true,
      hourStart: true,
      hourEnd: true,
    },
    where: {
      gameId: gameId
    },
    orderBy: {
      createAt: 'desc',
    }
  })
  return response.json(ads.map(ad => {
    return {
      ...ad,
      weekDays: ad.weekDays.split(',')
    }
  }))
})

app.get('/ads/:id/discord', async (request, response) => {
  const adId = request.params.id;

  const ad = await prisma.ad.findUnique({
    select: {
      discor: true,
    },
    where: {
      id: adId,
    }
  })
  return response.json([])
})

app.listen(3333)