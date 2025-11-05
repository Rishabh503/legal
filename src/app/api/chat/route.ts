import connectDB from "@/lib/db";
import Chat from "@/lib/models/chat";
import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
} from "@/lib/utils/errorHandler";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

// GET - Fetch chat messages between two users
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return createErrorResponse("Unauthorized", 401);
    }

    console.log("Chat GET - Authenticated user ID:", userId);

    await connectDB();

    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    console.log("Chat GET - Query parameters:", { from, to });

    if (!from || !to) {
      return createErrorResponse("Missing query parameters: from and to", 400);
    }

    // Fetch messages between the two users
    const messages = await Chat.find({
      $or: [
        { from: from, to: to },
        { from: to, to: from },
      ],
    }).sort({ timestamp: 1 }); // Oldest first

    console.log("Chat GET - Found messages:", messages.length);

    return createSuccessResponse(messages);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Create new chat message
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return createErrorResponse("Unauthorized", 401);
    }

    console.log("Chat POST - Authenticated user ID:", userId);

    await connectDB();

    const body = await req.json();
    const { from, to, content } = body;

    console.log("Chat POST - Message data:", { from, to, content: content?.substring(0, 50) + "..." });

    if (!from || !to || !content) {
      return createErrorResponse("Missing required fields: from, to, content", 400);
    }

    // Create chat message
    const chatMessage = await Chat.create({
      from,
      to,
      content,
      timestamp: new Date(),
    });

    console.log("Chat POST - Created message:", { id: chatMessage._id, from: chatMessage.from, to: chatMessage.to });

    return createSuccessResponse(chatMessage, "Message sent successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}