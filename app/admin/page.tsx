'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Plus, Edit, Trash2, Eye, ArrowLeft, Upload, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Fabric {
  id: number
  name: string
  description: string
  price_per_meter: number
  category: string
  color: string
  material: string
  width: number
  image_url: string
  stock: number
  featured: boolean
}

const defaultFabric: Omit<Fabric, 'id'> = {
  name: '',
  description: '',
  price_per_meter: 0,
  category: '',
  color: '',
  material: '',
  width: 150,
  image_url: '',
  stock: 0,
  featured: false
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fabrics, setFabrics] = useState<Fabric[]>([])
  const [editingFabric, setEditingFabric] = useState<Fabric | null>(null)
  const [formData, setFormData] = useState<Omit<Fabric, 'id'>>(defaultFabric)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    // Check if already authenticated
    const auth = localStorage.getItem('admin_authenticated')
    if (auth === 'true') {
      setIsAuthenticated(true)
      loadFabrics()
    }
  }, [])

  const handleLogin = async () => {
    setLoading(true)
    try {
      const response = await fetch('telas/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        setIsAuthenticated(true)
        localStorage.setItem('admin_authenticated', 'true')
        loadFabrics()
      } else {
        alert('Credenciales incorrectas')
      }
    } catch (error) {
      console.error('Error during login:', error)
      alert('Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('admin_authenticated')
    setUsername('')
    setPassword('')
  }

  const loadFabrics = async () => {
    try {
      const response = await fetch('telas/api/fabrics')
      if (response.ok) {
        const data = await response.json()
        setFabrics(data)
      }
    } catch (error) {
      console.error('Error loading fabrics:', error)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('telas/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const { imageUrl } = await response.json()
        setFormData(prev => ({ ...prev, image_url: imageUrl }))
      } else {
        const error = await response.json()
        alert(error.error || 'Error al subir la imagen')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.category || !formData.price_per_meter) {
      alert('Por favor completa los campos obligatorios')
      return
    }

    setLoading(true)
    try {
      const url = editingFabric ? `/api/fabrics/${editingFabric.id}` : '/api/fabrics'
      const method = editingFabric ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          pricePerMeter: formData.price_per_meter,
          category: formData.category,
          color: formData.color,
          material: formData.material,
          width: formData.width,
          imageUrl: formData.image_url,
          stock: formData.stock,
          featured: formData.featured,
        }),
      })

      if (response.ok) {
        await loadFabrics()
        setFormData(defaultFabric)
        setEditingFabric(null)
        setIsDialogOpen(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Error al guardar la tela')
      }
    } catch (error) {
      console.error('Error saving fabric:', error)
      alert('Error al guardar la tela')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (fabric: Fabric) => {
    setEditingFabric(fabric)
    setFormData({
      name: fabric.name,
      description: fabric.description,
      price_per_meter: fabric.price_per_meter,
      category: fabric.category,
      color: fabric.color,
      material: fabric.material,
      width: fabric.width,
      image_url: fabric.image_url,
      stock: fabric.stock,
      featured: fabric.featured,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`telas/api/fabrics/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadFabrics()
      } else {
        alert('Error al eliminar la tela')
      }
    } catch (error) {
      console.error('Error deleting fabric:', error)
      alert('Error al eliminar la tela')
    }
  }

  const openNewFabricDialog = () => {
    setEditingFabric(null)
    setFormData(defaultFabric)
    setIsDialogOpen(true)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Panel de Administración</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <Button onClick={handleLogin} className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Iniciar Sesión
              </Button>
              <div className="text-center">
                <Link href="/">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Catálogo
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Panel de Administración</h1>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Catálogo
                </Button>
              </Link>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Telas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fabrics.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Productos Destacados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fabrics.filter(f => f.featured).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Stock Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fabrics.reduce((sum, f) => sum + f.stock, 0)}m</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Telas</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewFabricDialog} className="bg-amber-600 hover:bg-amber-700">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Tela
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingFabric ? 'Editar Tela' : 'Nueva Tela'}</DialogTitle>
                <DialogDescription>
                  {editingFabric ? 'Modifica los datos de la tela' : 'Completa la información de la nueva tela'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoría *</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Precio por Metro (CUP) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price_per_meter}
                      onChange={(e) => setFormData({ ...formData, price_per_meter: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock">Stock (metros)</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="material">Material</Label>
                    <Input
                      id="material"
                      value={formData.material}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="width">Ancho (cm)</Label>
                    <Input
                      id="width"
                      type="number"
                      min="0"
                      value={formData.width}
                      onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) || 150 })}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                    />
                    <Label htmlFor="featured">Producto Destacado</Label>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="image">Imagen</Label>
                  <div className="mt-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="mb-2"
                      disabled={uploading}
                    />
                    {uploading && (
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Subiendo imagen...
                      </div>
                    )}
                    <Input
                      placeholder="O ingresa una URL de imagen"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    />
                    {formData.image_url && (
                      <div className="mt-2">
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-amber-600 hover:bg-amber-700" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {editingFabric ? 'Actualizar' : 'Guardar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Fabrics List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {fabrics.map((fabric) => (
            <Card key={fabric.id} className="overflow-hidden">
              <div className="aspect-square relative">
                <img
                  src={fabric.image_url || '/placeholder-fabric.jpg'}
                  alt={fabric.name}
                  className="w-full h-full object-cover"
                />
                {fabric.featured && (
                  <Badge className="absolute top-2 left-2 bg-amber-500">Destacado</Badge>
                )}
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{fabric.name}</CardTitle>
                <div className="flex justify-between items-center">
                  <Badge variant="outline">{fabric.category}</Badge>
                  <span className="text-lg font-bold text-amber-600">
                    {fabric.price_per_meter} CUP/m
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  <div>Color: {fabric.color}</div>
                  <div>Material: {fabric.material}</div>
                  <div>Stock: {fabric.stock}m</div>
                  <div>Ancho: {fabric.width}cm</div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(fabric)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar tela?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Se eliminará permanentemente "{fabric.name}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(fabric.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {fabrics.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No hay telas registradas aún.</p>
            <Button onClick={openNewFabricDialog} className="bg-amber-600 hover:bg-amber-700">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Primera Tela
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}