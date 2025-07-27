import bcrypt from "bcrypt";

async function generateHashes() {
    try {
        const adminHash = await bcrypt.hash('admin123', 10);
        const devHash = await bcrypt.hash('dev123', 10);
        
        console.log('Hash para admin123:', adminHash);
        console.log('Hash para dev123:', devHash);
        
        // Verificar que funcionan
        const adminCheck = await bcrypt.compare('admin123', adminHash);
        const devCheck = await bcrypt.compare('dev123', devHash);
        
        console.log('Verificación admin123:', adminCheck);
        console.log('Verificación dev123:', devCheck);
        
    } catch (error) {
        console.error('Error generando hashes:', error);
    }
}

generateHashes();
