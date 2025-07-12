'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ShoppingCart, Search, Filter, Plus, Minus, MessageCircle } from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
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

interface CartItem extends Fabric {
  quantity: number
  meters: number
}

export default function Home() {
  const [fabrics, setFabrics] = useState<Fabric[]>([])
  const [filteredFabrics, setFilteredFabrics] = useState<Fabric[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFabrics()
    loadCart()
  }, [])

  useEffect(() => {
    filterFabrics()
  }, [fabrics, searchTerm, categoryFilter])

  const loadFabrics = async () => {
    try {
      const response = await fetch('/api/fabrics')
      if (response.ok) {
        const data = await response.json()
        setFabrics(data)
      }
    } catch (error) {
      console.error('Error loading fabrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCart = () => {
    const storedCart = localStorage.getItem('cart')
    if (storedCart) {
      setCart(JSON.parse(storedCart))
    }
  }

  const saveCart = (newCart: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(newCart))
    setCart(newCart)
  }

  const filterFabrics = () => {
    let filtered = fabrics

    if (searchTerm) {
      filtered = filtered.filter(fabric =>
        fabric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fabric.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fabric.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(fabric => fabric.category === categoryFilter)
    }

    setFilteredFabrics(filtered)
  }

  const addToCart = (fabric: Fabric, meters: number) => {
    const existingItem = cart.find(item => item.id === fabric.id)
    let newCart: CartItem[]

    if (existingItem) {
      newCart = cart.map(item =>
        item.id === fabric.id
          ? { ...item, meters: item.meters + meters, quantity: item.quantity + 1 }
          : item
      )
    } else {
      newCart = [...cart, { ...fabric, quantity: 1, meters }]
    }

    saveCart(newCart)
  }

  const updateCartItem = (id: number, meters: number) => {
    const newCart = cart.map(item =>
      item.id === id ? { ...item, meters: Math.max(0.5, meters) } : item
    )
    saveCart(newCart)
  }

  const removeFromCart = (id: number) => {
    const newCart = cart.filter(item => item.id !== id)
    saveCart(newCart)
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price_per_meter * item.meters), 0)
  }

  const generateWhatsAppMessage = () => {
    const total = getTotalPrice()
    let message = `*FACTURA - CATÁLOGO DE TELAS*\n\n`
    message += `*ARTÍCULOS:*\n`
    
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`
      message += `   • Material: ${item.material}\n`
      message += `   • Color: ${item.color}\n`
      message += `   • Cantidad: ${item.meters}m\n`
      message += `   • Precio: ${item.price_per_meter} CUP/m\n`
      message += `   • Subtotal: ${(item.price_per_meter * item.meters).toLocaleString()} CUP\n\n`
    })
    
    message += `*TOTAL: ${total.toLocaleString()} CUP*\n\n`
    message += `¡Gracias por tu interés! `
    
    const whatsappUrl = `https://wa.me/+5355366583?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const categories = [...new Set(fabrics.map(f => f.category))]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando catálogo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg"></div>
              <h1 className="text-xl font-bold text-gray-900">Catálogo de Telas</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="relative">
                    <ShoppingCart className="h-4 w-4" />
                    {cart.length > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {cart.length}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Carrito de Compras</SheetTitle>
                    <SheetDescription>
                      Revisa tu selección antes de enviar a WhatsApp
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {cart.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">Tu carrito está vacío</p>
                    ) : (
                      <>
                        {cart.map((item) => (
                          <div key={item.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{item.name}</h4>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{item.color} - {item.material}</p>
                            <div className="flex items-center space-x-2 mb-2">
                              <label className="text-sm">Metros:</label>
                              <Input
                                type="number"
                                min="0.5"
                                step="0.5"
                                value={item.meters}
                                onChange={(e) => updateCartItem(item.id, parseFloat(e.target.value) || 0.5)}
                                className="w-20"
                              />
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>{item.price_per_meter} CUP/m</span>
                              <span className="font-medium">{(item.price_per_meter * item.meters).toLocaleString()} CUP</span>
                            </div>
                          </div>
                        ))}
                        <Separator />
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span>Total:</span>
                          <span>{getTotalPrice().toLocaleString()} CUP</span>
                        </div>
                        <Button 
                          onClick={generateWhatsAppMessage}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Enviar Pedido por WhatsApp
                        </Button>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar telas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Featured Section */}
        {fabrics.some(f => f.featured) && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Productos Destacados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fabrics.filter(f => f.featured).map((fabric) => (
                <FabricCard key={fabric.id} fabric={fabric} onAddToCart={addToCart} />
              ))}
            </div>
          </div>
        )}

        {/* All Products */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {searchTerm || categoryFilter !== 'all' ? 'Resultados de búsqueda' : 'Todas las Telas'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFabrics.map((fabric) => (
              <FabricCard key={fabric.id} fabric={fabric} onAddToCart={addToCart} />
            ))}
          </div>
          {filteredFabrics.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron telas que coincidan con tu búsqueda.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-orange-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 mb-2">¿Necesitas ayuda?</h3>
            <p className="text-gray-600 mb-4">Contáctanos directamente por WhatsApp</p>
            <Button 
              onClick={() => window.open('https://wa.me/5358126024', '_blank')}
              className="bg-green-600 hover:bg-green-700"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp: +53 5812 6024
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FabricCard({ fabric, onAddToCart }: { fabric: Fabric; onAddToCart: (fabric: Fabric, meters: number) => void }) {
  const [meters, setMeters] = useState(1)

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-square relative overflow-hidden">
        <img
          src={fabric.image_url || '/placeholder-fabric.jpg'}
          alt={fabric.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        {fabric.featured && (
          <Badge className="absolute top-2 left-2 bg-amber-500">Destacado</Badge>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary">{fabric.stock}m disponible</Badge>
        </div>
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{fabric.name}</CardTitle>
          <Badge variant="outline">{fabric.category}</Badge>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">{fabric.description}</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>Material:</span>
            <span className="font-medium">{fabric.material}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Color:</span>
            <span className="font-medium">{fabric.color}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Ancho:</span>
            <span className="font-medium">{fabric.width}cm</span>
          </div>
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-amber-600">
            {fabric.price_per_meter} CUP/m
          </span>
        </div>
        <div className="flex items-center space-x-2 mb-3">
          <label className="text-sm font-medium">Metros:</label>
          <Input
            type="number"
            min="0.5"
            step="0.5"
            value={meters}
            onChange={(e) => setMeters(parseFloat(e.target.value) || 0.5)}
            className="w-20"
          />
        </div>
        <Button
          onClick={() => onAddToCart(fabric, meters)}
          className="w-full bg-amber-600 hover:bg-amber-700"
          disabled={fabric.stock === 0}
        >
          <Plus className="mr-2 h-4 w-4" />
          {fabric.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
        </Button>
      </CardContent>
    </Card>
  )
}