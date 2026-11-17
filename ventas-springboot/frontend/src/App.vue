<script setup>
import { ref, onUnmounted } from 'vue'
import ProductosPanel from './components/ProductosPanel.vue'
import VentasPanel from './components/VentasPanel.vue'

const pestana = ref('productos')
const aviso = ref('')
let temporizador = null

function mostrarAviso(texto) {
  aviso.value = texto
  clearTimeout(temporizador)
  temporizador = setTimeout(() => (aviso.value = ''), 2800)
}

onUnmounted(() => clearTimeout(temporizador))
</script>

<template>
  <main class="hoja">
    <header class="encabezado">
      <div>
        <small>Libro de almacén · Micro Tienda</small>
        <h1>Inventario y ventas</h1>
      </div>
      <small>{{ new Date().toLocaleDateString('es-MX', { dateStyle: 'long' }) }}</small>
    </header>

    <nav class="pestanas">
      <button
        class="pestana"
        :class="{ activa: pestana === 'productos' }"
        @click="pestana = 'productos'"
      >
        Productos
      </button>
      <button
        class="pestana"
        :class="{ activa: pestana === 'ventas' }"
        @click="pestana = 'ventas'"
      >
        Ventas
      </button>
    </nav>

    <div class="contenido">
      <ProductosPanel v-if="pestana === 'productos'" @aviso="mostrarAviso" />
      <VentasPanel v-else @aviso="mostrarAviso" />
    </div>

    <div v-if="aviso" class="toast">{{ aviso }}</div>
  </main>
</template>