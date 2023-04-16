import { FastifyInstance } from "fastify";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { knex } from "../database";
import { checkSessionExists } from "../middleware/check-session-id-exists";

export async function transactionsRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: [checkSessionExists] }, async (request, reply) => {
    const { sessionId } = request.cookies;

    const transactions = await knex("transactions")
      .where("session_id", sessionId)
      .select();

    return {
      transactions,
    };
  });

  app.get("/summary", async (request) => {
    const { sessionId } = request.cookies;

    const summary = await knex("transactions")
      .where("session_id", sessionId)
      .sum("amount", { as: "amount" })
      .first();

    return { summary };
  });

  app.get("/:id", async (request) => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { sessionId } = request.cookies;

    const { id } = getTransactionParamsSchema.parse(request.params);

    const transaction = await knex("transactions")
      .where("id", id)
      .andWhere("session_id", sessionId)
      .first();

    return { transaction };
  });

  app.post("/", async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const { amount, title, type } = createTransactionBodySchema.parse(
      request.body
    );

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();

      reply.cookie("sessionId", sessionId, {
        path: "",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
    }

    await knex("transactions").insert({
      id: randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
      session_id: sessionId,
    });

    return reply.status(201).send("Criado com sucesso");
  });
}
