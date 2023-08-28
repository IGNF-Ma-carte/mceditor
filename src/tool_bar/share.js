import charte from "mcutils/charte/charte";
import shareCarte from 'mcutils/dialog/shareCarte'
import dialog from 'mcutils/dialog/dialog';
import carte from "../carte";

// Share
charte.addTool('share', 'fi-share-alt', 'Partager ma carte', () => {
  if (!shareCarte({ carte: carte })) {
    dialog.showMessage('Vous devez enregistrer la carte avant de pouvoir la partager...');
  }
});