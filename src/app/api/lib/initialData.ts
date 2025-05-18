import { Conversation } from "@/types/core";

// Initial data for the API with proper typing
const initialData: Conversation[] = [
  {
    id: "conv-sample-1",
    title: "Welcome to Chat-Flex",
    description: "This is your first conversation",
    messages: [
      {
        id: "msg-sample-1",
        sender: "user",
        timestamp: new Date(),
        content: {
          type: "text",
          data: "Welcome to Chat-Flex"
        }
      },
      {
        id: "msg-sample-2",
        sender: "ai",
        timestamp: new Date(),
        content: {
          type: "text",
          data: "Hello! This is your first Chat-Flex conversation. Try sending a message!"
        }
      }
    ]
  }
];

export default initialData;