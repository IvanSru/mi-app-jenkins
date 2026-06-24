const { sumar, saludar } = require('../src/app');

let errores = 0;

// Test 1
if (sumar(2, 3) === 5) {
  console.log('✅ Test sumar: PASÓ');
} else {
  console.log('❌ Test sumar: FALLÓ');
  errores++;
}

// Test 2
if (saludar('Ivan') === 'Hola, Ivan!') {
  console.log('✅ Test saludar: PASÓ');
} else {
  console.log('❌ Test saludar: FALLÓ');
  errores++;
}

if (errores > 0) {
  console.log(`\n${errores} test(s) fallaron`);
  process.exit(1);  // Esto hace que Jenkins marque el build como FALLIDO
} else {
  console.log('\nTodos los tests pasaron ✅');
}