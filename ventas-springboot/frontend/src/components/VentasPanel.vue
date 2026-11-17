<script setup>
import { ref, computed, onMounted } from 'vue'
import { api, formatoMoneda } from '../services/api'

const emit = defineEmits(['aviso'])

const ventas = ref([])
const productos = ref([])
const cargando = ref(false)
const enviando = ref(false)
const error = ref('')

const form = ref({ productoId: '', cantidad: 1 })

const productoSeleccionado = computed(() =>
  productos.value.find((p) => p.id === Number(form.value.productoId))
)

const totalVista = computed(() => {
  if (!productoSeleccionado.value || !form.value.cantidad) return 0
  return Number(productoSeleccionado.value.precio) * Number(form.value.cantidad)
})

function nombreProducto(id) {
  const p = productos.value.find((x) => x.id === id)
  return p ? p.nombre : `Producto #${id}`
}

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    const [v, p] = await Promise.all([api.ventas.listar(), api.productos.listar()])
    ventas.value = v.sort((a, b) => b.id - a.id)
    productos.value = p
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
}

async function registrar() {
  error.value = ''
  enviando.value = true
  try {
    await api.ventas.registrar({
      productoId: Number(form.value.productoId),
      cantidad: Number(form.value.cantidad)
    })
    emit('aviso', 'Venta registrada, existencias actualizadas')
    form.value = { productoId: '', cantidad: 1 }
    await cargar()
  } catch (e) {
    error.value = e.message
  } finally {
    enviando.value = false
  }
}

onMounted(cargar)
</script>

<template>
  <div class="dos-columnas">
    <form class="formulario" @submit.prevent="registrar">
      <h2>Nueva venta</h2>

      <div class="campo">
        <label for="producto">Producto</label>
        <select id="producto" v-model="form.productoId" required>
          <option disabled value="">Elige un producto</option>
          <option v-for="p in productos" :key="p.id" :value="p.id" :disabled="p.stock === 0">
            {{ p.nombre }} ({{ p.stock }} disp.)
          </option>
        </select>
      </div>

      <div class="campo">
        <label for="cantidad">Cantidad</label>
        <input id="cantidad" v-model="form.cantidad" type="number" min="1" required />
      </div>

      <div class="total-vista">
        {{ formatoMoneda(totalVista) }}
      </div>

      <div class="botones">
        <button class="btn btn-principal" type="submit" :disabled="enviando || !form.productoId">
          Registrar venta
        </button>
      </div>
    </form>

    <section>
      <div v-if="error" class="mensaje error">{{ error }}</div>

      <div class="tabla-wrap">
        <table>
          <thead>
            <tr>
              <th>Folio</th>
              <th>Producto</th>
              <th class="num">Cant.</th>
              <th class="num">Total</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="cargando">
              <td colspan="5" class="vacio">Leyendo el libro...</td>
            </tr>
            <tr v-else-if="ventas.length === 0">
              <td colspan="5" class="vacio">Todavía no hay ventas registradas.</td>
            </tr>
            <tr v-for="v in ventas" :key="v.id">
              <td class="id">#{{ v.id }}</td>
              <td>{{ nombreProducto(v.productoId) }}</td>
              <td class="num">{{ v.cantidad }}</td>
              <td class="num">{{ formatoMoneda(v.total) }}</td>
              <td>{{ new Date(v.fecha).toLocaleString('es-MX') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>