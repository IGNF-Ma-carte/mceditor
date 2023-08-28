
import charte from 'mcutils/charte/macarte'
import carte from '../carte'

// Print button
charte.addTool('print','fi-print','Imprimer', () => {
  carte.getControl('printDlg').print()
})

charte.addTool('')
