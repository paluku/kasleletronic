import { useState } from 'react';
import Picker from 'emoji-picker-react';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);

  const handleSend = () => {
    if (!text) return;
    setMessages([...messages, { text, side: 'right' }]);
    setText('');
  };

  const onEmojiClick = (emojiObject) => {
    setText(prev => prev + emojiObject.emoji);
  };

  return (
    <div>
      <h2>Chat</h2>
      <div className="chat-box">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.side}`}>
            {m.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input 
          type="text" 
          value={text} 
          onChange={e => setText(e.target.value)} 
          placeholder="Votre message..."
        />
        <button onClick={() => setShowEmoji(!showEmoji)}>😀</button>
        <button onClick={handleSend}>Envoyer</button>
        <input type="file" />
      </div>
      {showEmoji && <Picker onEmojiClick={onEmojiClick} />}
    </div>
  );
}