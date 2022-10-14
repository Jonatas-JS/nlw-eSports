import express from 'express'
import { PrismaClient } from '@prisma/client'
import convertHourStringToMinutes from './utils/convert-hour-string-to-minutes'

const app = express()

app.use(express.json()) //por padrão o Express não entende que estou usando JSON, então é necessário esse código.

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

app.post('/games/:id/ads', async (request, response) => {
  const gameId = request.params.id;
  const body: any = request.body;

  const ad = await prisma.ad.create({
    data: {
      gameId,
      name: body.name,
      yearsPlaying: body.yearsPlaying,
      discor: body.discor,
      weekDays: body.weekDays.join(','),
      hourStart: convertHourStringToMinutes(body.hourStart),
      hourEnd: convertHourStringToMinutes(body.hourEnd),
      useVoiceChannel: body.useVoiceChannel,
    }
  })

  return response.status(201).json(ad);
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

  const ad = await prisma.ad.findUniqueOrThrow({
    select: {
      discor: true,
    },
    where: {
      id: adId,
    }
  })
  return response.json({
    discord: ad.discor,
  })
})


app.listen(3333)