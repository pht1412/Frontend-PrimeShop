import React, { useEffect, useState } from "react";
import api from "../../api/api";
import { Button, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "../../pages/games/games.css";

const GameListPage: React.FC = () => {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/minigame/list")
      .then(res => setGames(res.data.games))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <div className="games-container">
      <div className="games-title">Danh sách trò chơi nhận voucher</div>
      <div className="games-list-grid">
        {games.map(game => (
          <div className="game-card" key={game.gameId}>
            <div className="game-card-icon">{game.icon}</div>
            <div className="game-card-title">{game.name}</div>
            <div className="game-card-desc">{game.description}</div>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/minigame/${game.gameId}`)}
            >
              Chơi ngay
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameListPage;