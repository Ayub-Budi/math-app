import { useState, useEffect } from 'react';
import TitleModal from './TitleModal';

export function useGameProgress(gameId: string) {
  const [userId, setUserId] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [earnedTitle, setEarnedTitle] = useState<string | null>(null);
  const [hearts, setHearts] = useState<number>(5);
  const [loading, setLoading] = useState(true);

  const [totalXp, setTotalXp] = useState<number>(0);
  const [gamePoints, setGamePoints] = useState<number>(0);

  // Load userId and progress on mount
  useEffect(() => {
    let storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      storedUserId = 'guest_' + Math.random().toString(36).substring(7);
      localStorage.setItem('userId', storedUserId);
    }
    setUserId(storedUserId);

    // Fetch user health and game progress
    async function fetchData() {
      try {
        const [progressRes, userRes] = await Promise.all([
          fetch(`/api/games/progress?userId=${storedUserId}&gameId=${gameId}`),
          fetch(`/api/user?userId=${storedUserId}`)
        ]);

        const progressData = await progressRes.json();
        const userData = await userRes.json();

        if (progressData.progress) {
          if (progressData.progress.level) {
            setCurrentLevel(progressData.progress.level);
          }
          if (progressData.progress.isMaxed) {
            setIsGameFinished(true);
          }
        }

        if (userData.totalXp !== undefined) {
          setTotalXp(userData.totalXp);
        }

        if (userData.gamePoints !== undefined) {
          setGamePoints(userData.gamePoints);
        }

        if (userData.health !== undefined) {
          setHearts(userData.health);
        }
      } catch (err) {
        console.error('Error fetching game data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [gameId]);

  const MAX_LEVEL = 10;
  const [isGameFinished, setIsGameFinished] = useState(false);

  // Function to save level progress
  const saveProgress = async (newLevel: number) => {
    if (newLevel > MAX_LEVEL) {
      setIsGameFinished(true);
      // Tetap kirim ke DB agar status isMaxed tersimpan permanen
      if (userId) {
        try {
          await fetch('/api/games/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, gameId, level: MAX_LEVEL }) 
          });
        } catch (err) {
          console.error('Error saving max progress:', err);
        }
      }
      return;
    }
    
    setCurrentLevel(newLevel);
    if (!userId) return;

    try {
      const res = await fetch('/api/games/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, gameId, level: newLevel })
      });
      const data = await res.json();
      
      if (data.newTitle) {
        setEarnedTitle(data.newTitle);
      }
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  // Function to deduct a heart
  const deductHeart = async () => {
    if (!userId) return 0;

    let finalHearts = 0;
    
    // Gunakan promise untuk menunggu set state React (fungsional update) selesai
    await new Promise<void>(resolve => {
      setHearts(prev => {
        if (prev <= 0) {
          finalHearts = 0;
          resolve();
          return 0;
        }
        finalHearts = prev - 1;
        resolve();
        return finalHearts;
      });
    });

    if (finalHearts === 0 && hearts === 0) return 0;

    try {
      await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, health: finalHearts })
      });
    } catch (err) {
      console.error('Error updating health:', err);
    }
    return finalHearts;
  };

  // Function to add Game Points
  const addGamePoints = async (amount: number) => {
    if (!userId || amount <= 0) return;
    
    setGamePoints(prev => prev + amount); // Update UI local
    try {
      // We'll use a special endpoint or just update User directly
      // For now, let's update via a new API or reuse user PUT
      await fetch('/api/games/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          gameId,
          points: amount
        })
      });
    } catch (err) {
      console.error('Error adding Game Points:', err);
    }
  };

  // Function to add XP (for backwards compatibility/learning)
  const addXP = async (amount: number) => {
    if (!userId || amount <= 0) return;
    
    setTotalXp(prev => prev + amount); // Update UI local
    try {
      await fetch('/api/learning/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          categoryId: 'learning',
          topicId: 'general',
          score: amount,
          isCompleted: false
        })
      });
    } catch (err) {
      console.error('Error adding XP:', err);
    }
  };

  const handleGlobalReset = async () => {
    if (!confirm("Reset seluruh progres akun (XP, Level, Nyawa) untuk mulai dari nol?")) return;
    
    try {
      const res = await fetch('/api/user/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetThisGame = async () => {
    if (!confirm("Ulangi game ini dari Level 1? (Nyawa dan XP Anda tidak akan berubah)")) return;
    setIsGameFinished(false);
    setCurrentLevel(1);
    if (userId) {
      try {
        await fetch('/api/games/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, gameId, level: 1 }) 
        });
      } catch (err) {
        console.error('Error resetting game level:', err);
      }
    }
  };

  // Component to render the title modal
  const renderTitleModal = () => (
    <TitleModal 
      title={earnedTitle} 
      onClose={() => setEarnedTitle(null)} 
    />
  );

  return {
    currentLevel,
    earnedTitle,
    setEarnedTitle,
    hearts,
    deductHeart,
    addGamePoints,
    addXP,
    totalXp,
    gamePoints,
    saveProgress,
    loading,
    renderTitleModal,
    handleGlobalReset,
    resetThisGame,
    isGameFinished,
    MAX_LEVEL
  };
}
