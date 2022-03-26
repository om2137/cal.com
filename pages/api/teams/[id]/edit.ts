import prisma from "@calcom/prisma";

import { Team } from "@calcom/prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

import { schemaTeam, withValidTeam } from "@lib/validations/team";
import { schemaQueryId, withValidQueryIdTransformParseInt } from "@lib/validations/shared/queryIdTransformParseInt";

type ResponseData = {
  data?: Team;
  message?: string;
  error?: unknown;
};

export async function editTeam(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const { query, body, method } = req;
  const safeQuery = await schemaQueryId.safeParse(query);
  const safeBody = await schemaTeam.safeParse(body);

  if (method === "PATCH") {
    if (safeQuery.success && safeBody.success) {
      await prisma.team.update({
        where: { id: safeQuery.data.id },
        data: safeBody.data,
      }).then(team => {
        res.status(200).json({ data: team });
      }).catch(error => {
        res.status(404).json({ message: `Event type with ID ${safeQuery.data.id} not found and wasn't updated`, error })
      });
    }
  } else {
    // Reject any other HTTP method than POST
    res.status(405).json({ message: "Only PATCH Method allowed for updating teams"  });
  }
}

export default withValidQueryIdTransformParseInt(withValidTeam(editTeam));
