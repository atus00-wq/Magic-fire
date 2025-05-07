import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a default player if it doesn't exist yet
  app.get('/api/init', async (req, res) => {
    try {
      // Check if player 1 exists
      let player = await storage.getPlayer(1);
      
      // If not, create a default player
      if (!player) {
        player = await storage.createPlayer({ 
          name: "AI Fire Geeter", 
          isActive: true, 
          discoveries: 0 
        });
        console.log('Created default player:', player);
      }
      
      res.status(200).json({ player });
    } catch (error) {
      console.error('Error initializing app:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message });
    }
  });

  // API endpoint to record discoveries
  app.post('/api/discovery', async (req, res) => {
    try {
      const { playerId, discoveryId } = req.body;
      
      // Validate input
      if (!playerId || !discoveryId) {
        return res.status(400).json({ message: 'Player ID and Discovery ID are required' });
      }
      
      // Check if player exists, create if not
      let player = await storage.getPlayer(playerId);
      if (!player) {
        player = await storage.createPlayer({
          name: "AI Fire Geeter",
          isActive: true,
          discoveries: 0
        });
        console.log(`Created player ${playerId}:`, player);
      }
      
      // Record the discovery
      const result = await storage.recordDiscovery(playerId, discoveryId);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error recording discovery:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message });
    }
  });

  // API endpoint to get a player's discoveries
  app.get('/api/player/:id/discoveries', async (req, res) => {
    try {
      const playerId = parseInt(req.params.id);
      
      if (isNaN(playerId)) {
        return res.status(400).json({ message: 'Invalid player ID' });
      }
      
      const discoveries = await storage.getPlayerDiscoveries(playerId);
      res.status(200).json({ discoveries });
    } catch (error) {
      console.error('Error getting player discoveries:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message });
    }
  });

  // API endpoint to register a new player
  app.post('/api/player', async (req, res) => {
    try {
      const { name } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: 'Player name is required' });
      }
      
      const player = await storage.createPlayer({ name, isActive: false, discoveries: 0 });
      res.status(201).json(player);
    } catch (error) {
      console.error('Error creating player:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
