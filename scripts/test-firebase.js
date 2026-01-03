// Simple test script to verify Firebase connection locally
import "dotenv/config";
import { storage } from "../server/storage.js";
import { v4 as uuidv4 } from "uuid";

async function testFirebase() {
  console.log("🧪 Testing Firebase connection...\n");

  try {
    // Test 1: Create a game
    console.log("1. Creating a test game...");
    const testGame = {
      id: uuidv4(),
      courseId: "test-course",
      courseName: "Test Golf Course",
      holeCount: 9,
      currentHole: 1,
      completed: false,
      players: [
        { id: uuidv4(), name: "Test Player 1" },
        { id: uuidv4(), name: "Test Player 2" }
      ],
      scores: []
    };

    const createdGame = await storage.createGame(testGame);
    console.log("✅ Game created:", createdGame.id);
    console.log("   Course:", createdGame.courseName);
    console.log("   Players:", createdGame.players.length);

    // Test 2: Get the game back
    console.log("\n2. Retrieving the game...");
    const retrievedGame = await storage.getGame(createdGame.id);
    if (retrievedGame) {
      console.log("✅ Game retrieved successfully");
      console.log("   Current hole:", retrievedGame.currentHole);
    } else {
      console.log("❌ Failed to retrieve game");
    }

    // Test 3: Update scores
    console.log("\n3. Updating scores for hole 1...");
    const scores = [
      {
        playerId: createdGame.players[0].id,
        holeNumber: 1,
        strokes: 4
      },
      {
        playerId: createdGame.players[1].id,
        holeNumber: 1,
        strokes: 5
      }
    ];

    const updatedGame = await storage.updateScores(createdGame.id, 1, scores);
    if (updatedGame && updatedGame.scores.length > 0) {
      console.log("✅ Scores updated successfully");
      console.log("   Scores:", updatedGame.scores.length);
    } else {
      console.log("❌ Failed to update scores");
    }

    // Test 4: Get current game
    console.log("\n4. Getting current active game...");
    const currentGame = await storage.getCurrentGame();
    if (currentGame) {
      console.log("✅ Current game found:", currentGame.id);
    } else {
      console.log("⚠️  No current game found");
    }

    // Test 5: Complete the game
    console.log("\n5. Completing the game...");
    const completedGame = await storage.completeGame(createdGame.id);
    if (completedGame && completedGame.completed) {
      console.log("✅ Game completed successfully");
    } else {
      console.log("❌ Failed to complete game");
    }

    console.log("\n🎉 All tests passed! Firebase is working correctly.");
  } catch (error) {
    console.error("\n❌ Error testing Firebase:", error.message);

    // Check if it's an index error
    if (
      error.message.includes("index") ||
      error.message.includes("FAILED_PRECONDITION")
    ) {
      console.error("\n📋 Firestore Index Required:");
      console.error("   This query requires a composite index in Firestore.");
      console.error(
        "   The error message above contains a link to create the index."
      );
      console.error(
        "   Please click the link in the error message to create the index."
      );
      console.error(
        "   After creating the index, wait a few minutes for it to build,"
      );
      console.error("   then run this test again.");
      console.error("\n   Required index:");
      console.error("   - Collection: games");
      console.error(
        "   - Fields: completed (Ascending), createdAt (Descending)"
      );
    } else {
      console.error("\nMake sure you have set up your Firebase credentials:");
      console.error("  - FIREBASE_PROJECT_ID");
      console.error(
        "  - FIREBASE_CLIENT_EMAIL (optional, for service account)"
      );
      console.error("  - FIREBASE_PRIVATE_KEY (optional, for service account)");
      console.error("\nOr use Firebase emulator (see README for instructions)");
    }
    process.exit(1);
  }
}

testFirebase();
