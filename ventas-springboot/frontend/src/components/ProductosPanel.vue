<script setup>
import { ref, computed, onMounted } from 'vue'
import { api, formatoMoneda } from '../services/api'

const emit = defineEmits(['aviso'])

const productos = ref([])
const cargando = ref(false)
const enviando = ref(false)
const error = ref('')
const editandoId = ref(null)

const vacio = { nombre: '', precio: '', stock: '' }
const form = ref({ ...vacio })

const esEdicion = computed(() => editandoId.value !== null)

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    productos.value = await api.productos.listar()
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
}

function editar(p) {
  editandoId.value = p.id
  form.value = { nombre: p.nombre, precio: p.precio, stock: p.stock }
  error.value = ''
}

function cancelar() {
  editandoId.value = null
  form.value = { ...vacio }
  error.value = ''
}

async function guardar() {
  error.value = ''
  enviando.value = true

  const datos = {
    nombre: String(form.value.nombre).trim(),
    precio: Number(form.value.precio),
    stock: Number(form.value.stock)
  }

  try {
    if (esEdicion.value) {
      await api.productos.actualizar(editandoId.value, datos)
      emit('aviso', 'Producto actualizado')
    } else {
      await api.productos.crear(datos)
      emit('aviso', 'Producto registrado en el libro')
    }
    cancelar()
    await cargar()
  } catch (e) {
    error.value = e.message
  } finally {
    enviando.value = false
  }
}

async function eliminar(p) {
  if (!confirm(`¿Dar de baja "${p.nombre}"?`)) return
  error.value = ''
  try {
    await api.productos.eliminar(p.id)
    emit('aviso', 'Producto eliminado')
    await cargar()
  } catch (e) {
    error.value = e.message
  }
}

onMounted(cargar)
</script>

<template>
  <div class="dos-columnas">
    <form class="formulario" @submit.prevent="guardar">
      <h2>{{ esEdicion ? 'Corregir producto' : 'Nuevo producto' }}</h2>

      <div class="campo">
        <label for="nombre">Nombre</label>
        <input id="nombre" v-model="form.nombre" maxlength="100" required />
      </div>

      <div class="campo">
        <label for="precio">Precio (MXN)</label>
        <input id="precio" v-model="form.precio" type="number" step="0.01" min="0" required />
      </div>

      <div class="campo">
        <label for="stock">Existencias</label>
        <input id="stock" v-model="form.stock" type="number" min="0" required />
      </div>

      <div class="botones">
        <button class="btn btn-principal" type="submit" :disabled="enviando">
          {{ esEdicion ? 'Guardar cambios' : 'Registrar' }}
        </button>
        <button v-if="esEdicion" class="btn" type="button" @click="cancelar">Cancelar</button>
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
              <th class="num">Precio</th>
              <th class="num">Existencias</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="cargando">
              <td colspan="5" class="vacio">Leyendo el libro...</td>
            </tr>
            <tr v-else-if="productos.length === 0">
              <td colspan="5" class="vacio">Aún no hay productos registrados.</td>
            </tr>
            <tr v-for="p in productos" :key="p.id">
              <td class="id">#{{ p.id }}</td>
              <td>{{ p.nombre }}</td>
              <td class="num">{{ formatoMoneda(p.precio) }}</td>
              <td class="num">
                {{ p.stock }}
                <span v-if="p.stock === 0" class="sello bajo">agotado</span>
                <span v-else-if="p.stock <= 5" class="sello bajo">bajo</span>
              </td>
              <td class="num">
                <button class="btn btn-pequeno" @click="editar(p)">Editar</button>
                <button class="btn btn-pequeno btn-peligro" @click="eliminar(p)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>