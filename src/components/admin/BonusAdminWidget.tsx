import React, { useState } from 'react';
import { Zap, Loader2, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { sendPushNotification } from '../../lib/notifications';

interface BonusAdminWidgetProps {
  gameId: string;
  onSuccess: () => void;
}

export const BonusAdminWidget: React.FC<BonusAdminWidgetProps> = ({ gameId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(15);
  const [points, setPoints] = useState(5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      // 1. Insert into bonus_challenges
      const result = await supabase
        .from('bonus_challenges')
        .insert([{
          game_id: gameId,
          title,
          description,
          duration_minutes: duration,
          points
        }])
        .select()
        .single();
      const error = result.error;
      
      if (error) throw error;

      // 2. Trigger push notification
      await sendPushNotification(gameId, 'bonus_release', { title });

      setTitle('');
      setDescription('');
      onSuccess();
    } catch (error: any) {
      console.error('Error sending bonus:', error);
      alert(`Failed to send bonus: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: 'var(--radius-md)',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #E5E7EB',
      marginBottom: '1.5rem',
      maxWidth: '500px',
      minWidth: '350px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <Zap size={24} color="var(--color-primary)" />
        <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Send Bonus Challenge</h2>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input 
          type="text" 
          placeholder="Challenge Title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
          style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #D1D5DB' }}
        />
        <textarea 
          placeholder="Challenge Description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #D1D5DB', minHeight: '80px' }}
        />
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Duration (min)</label>
            <input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} required style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid #D1D5DB' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Points</label>
            <input type="number" value={points} onChange={(e) => setPoints(parseInt(e.target.value))} required style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid #D1D5DB' }} />
          </div>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', 
            padding: '0.75rem', backgroundColor: 'var(--color-secondary)', color: 'white', 
            borderRadius: 'var(--radius-md)', fontWeight: 'bold', marginTop: '0.5rem' 
          }}
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={18} />}
          SEND TO TEAMS
        </button>
      </form>
    </div>
  );
};
