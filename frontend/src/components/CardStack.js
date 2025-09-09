import React from 'react';
import { supabase } from '../supabaseClient';
import { useTheme } from '../context/ThemeContext';

const EMOTIONS = [
  { name: 'happy', title: 'Happy', description: `I understand you are feeling happy. It’s wonderful that you're experiencing a sense of joy and contentment right now. Happiness can feel like a bright, warm light inside, making everything seem a little easier and more hopeful.

To extend this feeling, try sharing it with someone you care about or take a moment to savor it by noticing the specific things that are contributing to your joy. You could also capture this moment in a journal to revisit later.` },
  { name: 'calm', title: 'Calm', description: `I understand you are feeling calm. This sense of tranquility and inner peace is a restful and centering state to be in. It’s like the quiet stillness of a peaceful morning, where your mind is clear and your body is at ease.

Embrace this feeling by engaging in a quiet activity you enjoy, like reading or listening to soft music. Practice some gentle, deep breathing to fully immerse yourself in this state of relaxation.` },
  { name: 'energized', title: 'Energized', description: `I understand you are feeling energized. It sounds like you're full of vitality and motivation, ready to take on new challenges. This feeling is like a powerful current, propelling you forward with enthusiasm and a can-do attitude.

Channel this wonderful energy into something productive or creative that you've been wanting to start. Remember to also listen to your body and take short breaks to ensure you can sustain this momentum without burning out.` },
  { name: 'neutral', title: 'Neutral', description: `I understand you are feeling neutral. Sometimes, just being steady and present without strong highs or lows is exactly what we need. It’s a moment of balance, a stable ground from which you can observe your thoughts without being carried away by them.

This is a great opportunity for gentle self-reflection. You could use this clarity to plan your day or simply observe the world around you without pressure to feel a certain way.` },
  { name: 'anxious', title: 'Anxious', description: `I understand you are feeling anxious. Anxiety often feels like your mind is racing ahead, caught in a loop of 'what ifs' and worries about the future. It can create a sense of unease and tension in your body.

Try to ground yourself in the present moment. Focus on your breath, feeling the air move in and out, or notice five things you can see or hear around you right now. This can help quiet the noise and bring you back to the present.` },
  { name: 'sad', title: 'Sad', description: `I understand you are feeling sad. Sadness is a natural response to loss or disappointment, and it can feel heavy, like a cloud dimming your inner light. It’s a sign that you care deeply about something.

Allow yourself the space to feel this without judgment; it's okay to not be okay. Consider reaching out to a friend or engaging in a comforting activity, like wrapping yourself in a warm blanket with a cup of tea.` },
  { name: 'frustrated', title: 'Frustrated', description: `I understand you are feeling frustrated. This feeling often arises when you're blocked from a goal or feel stuck, leading to a build-up of restless, irritated energy. It's a sign that something is important to you and isn't going as planned.

It might be helpful to take a short step back from the source of your frustration. A brief walk or a few deep breaths can create the mental space needed to see the problem with a fresh perspective.` },
  { name: 'overwhelmed', title: 'Overwhelmed', description: `I understand you are feeling overwhelmed. It can feel like you're trying to hold too many things at once, and the weight is becoming too much to bear. This is a signal that your mind and body are asking for a pause.

Focus on just one small, manageable task. Breaking down a large to-do list into tiny steps can make it feel much more achievable and help you regain a sense of control.` },
  { name: 'angry', title: 'Angry', description: `I understand you are feeling angry. Anger is often a response to feeling that a boundary has been crossed or that a situation is unfair. It’s a powerful, hot energy that signals something needs to change.

Acknowledge the anger without letting it consume you. You could try channeling that intense energy into a physical activity like a brisk walk, or write down everything you're feeling to release it in a safe, private space.` },
  { name: 'tired', title: 'Tired', description: `I understand you are feeling tired. This deep sense of exhaustion can affect both your body and mind, making even simple tasks feel like a huge effort. It's your body’s clear signal that it needs to recharge its batteries.

Please give yourself permission to rest without guilt. Even a short 15-minute break to close your eyes, listen to music, or simply sit quietly can make a significant difference in restoring your energy.` }
];

function CardStack({ showAlert }) {
  const { applyTheme } = useTheme();

  const onCardClick = async (moodName) => {
    const name = moodName.toLowerCase();
    applyTheme(name);
    try {
      const { data, error } = await supabase.from('mood_logs').insert({ mood_name: name });
      if (error) throw error;
      if (showAlert) showAlert(`Your mood "${name}" has been logged!`, true);
    } catch (err) {
      if (showAlert) showAlert('Network error or server unavailable during mood logging.', false);
    }
  };

  return (
    <div className="card-stack-row">
      {EMOTIONS.map((emotion, i) => (
        <div
          key={i}
          className={`card-stack-item is-clickable ${emotion.name === 'angry' ? 'emotion-angry' : ''}`}
          role="button"
          tabIndex={0}
          aria-label={`Select mood ${emotion.title}`}
          onClick={() => onCardClick(emotion.name)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onCardClick(emotion.name); }}
        >
          <div className="card-vertical">
            <span className="card-name">{emotion.title}</span>
          </div>
          <div className="card-details">
            <h3 className="card-details-title">{emotion.title}</h3>
            {emotion.description.split('\n\n').map((para, idx) => (
              <p key={idx} className="card-details-text">{para}</p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default CardStack;
