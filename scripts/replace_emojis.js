const fs = require('fs');
const path = require('path');
function rep(file, rules) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  rules.forEach(([search, replace]) => {
     let newCnt = content.split(search).join(replace);
     if (newCnt !== content) { content = newCnt; changed = true; }
  });
  if (changed) {
    if (!content.includes('@expo/vector-icons') && !file.includes('index.jsx')) {
      content = "import { Ionicons } from '@expo/vector-icons';\n" + content;
    }
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
}

rep('src/screens/Chat/ChatsListScreen.jsx', [
  ['<Text style={{fontSize: 10, color: \'#1E293B\', fontWeight: \'bold\'}}>✔</Text>', '<Ionicons name="checkmark" size={10} color="#1E293B" />']
]);

rep('src/screens/Discover/DiscoverScreen.jsx', [
  ['<Text style={{fontSize: 10, color: \'#1E293B\', fontWeight: \'bold\'}}>✔</Text>', '<Ionicons name="checkmark" size={10} color="#1E293B" />']
]);

