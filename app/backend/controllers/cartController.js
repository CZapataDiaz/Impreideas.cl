const { Cart, CartItem, Product } = require('../models');

/**
 * Controlador de carrito de compras
 * Maneja operaciones de carrito para usuarios autenticados y anónimos
 */
class CartController {
  
  /**
   * Obtener carrito actual
   * GET /api/cart
   */
  async getCart(req, res) {
    try {
      const userId = req.user?.id; // Usuario autenticado (opcional)
      const sessionId = req.sessionID || req.headers['x-session-id']; // Sesión anónima

      let cart;

      if (userId) {
        // Buscar carrito del usuario autenticado
        cart = await Cart.findOne({
          where: { userId, status: 'active' },
          include: [
            {
              association: 'items',
              include: ['product']
            }
          ]
        });
      } else if (sessionId) {
        // Buscar carrito por sesión anónima
        cart = await Cart.findOne({
          where: { sessionId, status: 'active' },
          include: [
            {
              association: 'items',
              include: ['product']
            }
          ]
        });
      }

      // Si no hay carrito, crear uno vacío
      if (!cart) {
        cart = await Cart.create({
          userId,
          sessionId,
          status: 'active',
          totalAmount: 0
        });
      }

      res.json({
        cart,
        itemCount: cart.items?.length || 0,
        total: parseFloat(cart.totalAmount || 0)
      });

    } catch (error) {
      console.error('Error al obtener carrito:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudo obtener el carrito'
      });
    }
  }

  /**
   * Agregar item al carrito
   * POST /api/cart/items
   */
  async addItem(req, res) {
    try {
      const { productId, quantity, personalization } = req.body;
      const userId = req.user?.id;
      const sessionId = req.sessionID || req.headers['x-session-id'];

      // Validar producto
      const product = await Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({
          error: 'Producto no encontrado',
          message: `El producto con ID ${productId} no existe`
        });
      }

      // Validar cantidad mínima
      const minimumOrder = product.minOrder || product.minimum_order || 1;
      if (quantity < minimumOrder) {
        return res.status(400).json({
          error: 'Cantidad inválida',
          message: `La cantidad mínima para este producto es ${minimumOrder} unidades`
        });
      }

      // Buscar o crear carrito
      let cart = await Cart.findOne({
        where: userId
          ? { userId, status: 'active' }
          : { sessionId, status: 'active' }
      });

      if (!cart) {
        cart = await Cart.create({
          userId,
          sessionId,
          status: 'active',
          totalAmount: 0
        });
      }

      // Verificar si el item ya existe con la misma personalización
      const existingItem = await CartItem.findOne({
        where: {
          cartId: cart.id,
          productId,
          personalization: personalization || null
        }
      });

      let cartItem;
      const basePrice = parseFloat(product.base_price || product.basePrice || 0);

      if (existingItem) {
        // Actualizar cantidad del item existente
        existingItem.quantity += quantity;
        await existingItem.save();
        cartItem = existingItem;
      } else {
        // Crear nuevo item
        cartItem = await CartItem.create({
          cartId: cart.id,
          productId,
          quantity,
          unitPrice: basePrice,
          personalization: personalization || null
        });
      }

      // Recalcular total del carrito
      await cart.calculateTotal();

      // Recargar carrito con items
      await cart.reload({
        include: [
          {
            association: 'items',
            include: ['product']
          }
        ]
      });

      res.status(201).json({
        message: 'Item agregado al carrito',
        cart,
        item: cartItem
      });

    } catch (error) {
      console.error('Error al agregar item:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudo agregar el item al carrito'
      });
    }
  }

  /**
   * Actualizar cantidad de item
   * PUT /api/cart/items/:id
   */
  async updateItem(req, res) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const userId = req.user?.id;
      const sessionId = req.sessionID || req.headers['x-session-id'];

      // Buscar item
      const cartItem = await CartItem.findByPk(id, {
        include: ['cart', 'product']
      });

      if (!cartItem) {
        return res.status(404).json({
          error: 'Item no encontrado',
          message: 'El item del carrito no existe'
        });
      }

      // Verificar que el item pertenece al usuario/sesión
      const cart = cartItem.cart;
      if ((userId && cart.userId !== userId) || 
          (!userId && cart.sessionId !== sessionId)) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: 'No tienes permiso para modificar este item'
        });
      }

      // Validar cantidad mínima
      const product = cartItem.product;
      const minimumOrder = product.minimum_order || product.minOrder || 1;
      if (quantity < minimumOrder) {
        return res.status(400).json({
          error: 'Cantidad inválida',
          message: `La cantidad mínima es ${minimumOrder} unidades`
        });
      }

      // Actualizar cantidad
      await cartItem.updateQuantity(quantity);

      // Recalcular total del carrito
      await cart.calculateTotal();

      // Recargar carrito
      await cart.reload({
        include: [
          {
            association: 'items',
            include: ['product']
          }
        ]
      });

      res.json({
        message: 'Item actualizado',
        cart,
        item: cartItem
      });

    } catch (error) {
      console.error('Error al actualizar item:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudo actualizar el item'
      });
    }
  }

  /**
   * Eliminar item del carrito
   * DELETE /api/cart/items/:id
   */
  async removeItem(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const sessionId = req.sessionID || req.headers['x-session-id'];

      // Buscar item
      const cartItem = await CartItem.findByPk(id, {
        include: ['cart']
      });

      if (!cartItem) {
        return res.status(404).json({
          error: 'Item no encontrado',
          message: 'El item del carrito no existe'
        });
      }

      // Verificar permisos
      const cart = cartItem.cart;
      if ((userId && cart.userId !== userId) || 
          (!userId && cart.sessionId !== sessionId)) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: 'No tienes permiso para eliminar este item'
        });
      }

      // Eliminar item
      await cartItem.destroy();

      // Recalcular total
      await cart.calculateTotal();

      // Recargar carrito
      await cart.reload({
        include: [
          {
            association: 'items',
            include: ['product']
          }
        ]
      });

      res.json({
        message: 'Item eliminado del carrito',
        cart
      });

    } catch (error) {
      console.error('Error al eliminar item:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudo eliminar el item'
      });
    }
  }

  /**
   * Vaciar carrito
   * POST /api/cart/clear
   */
  async clearCart(req, res) {
    try {
      const userId = req.user?.id;
      const sessionId = req.sessionID || req.headers['x-session-id'];

      // Buscar carrito
      const cart = await Cart.findOne({
        where: userId
          ? { userId, status: 'active' }
          : { sessionId, status: 'active' }
      });

      if (!cart) {
        return res.status(404).json({
          error: 'Carrito no encontrado',
          message: 'No se encontró un carrito activo'
        });
      }

      // Eliminar todos los items
      await CartItem.destroy({
        where: { cartId: cart.id }
      });

      // Actualizar total
      cart.totalAmount = 0;
      await cart.save();

      res.json({
        message: 'Carrito vaciado correctamente',
        cart
      });

    } catch (error) {
      console.error('Error al vaciar carrito:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudo vaciar el carrito'
      });
    }
  }

  /**
   * Sincronizar carrito local con servidor al hacer login
   * POST /api/cart/sync
   */
  async syncCart(req, res) {
    try {
      const userId = req.user.id;
      const { items } = req.body;

      if (!items || !Array.isArray(items)) {
        return res.status(400).json({
          error: 'Datos inválidos',
          message: 'Se requiere un array de items para sincronizar'
        });
      }

      // Buscar carrito del usuario
      let cart = await Cart.findOne({
        where: { userId, status: 'active' }
      });

      if (!cart) {
        cart = await Cart.create({
          userId,
          status: 'active',
          totalAmount: 0
        });
      }

      // Agregar items del carrito local al carrito del servidor
      for (const item of items) {
        const product = await Product.findByPk(item.productId);
        if (!product) continue;

        // Verificar si ya existe
        const existing = await CartItem.findOne({
          where: {
            cartId: cart.id,
            productId: item.productId,
            personalization: item.personalization || null
          }
        });

        if (existing) {
          // Sumar cantidades
          existing.quantity += item.quantity;
          await existing.save();
        } else {
          // Crear nuevo
          await CartItem.create({
            cartId: cart.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: product.base_price || product.basePrice,
            personalization: item.personalization || null
          });
        }
      }

      // Recalcular total
      await cart.calculateTotal();

      // Recargar con items
      await cart.reload({
        include: [
          {
            association: 'items',
            include: ['product']
          }
        ]
      });

      res.json({
        message: 'Carrito sincronizado correctamente',
        cart
      });

    } catch (error) {
      console.error('Error al sincronizar carrito:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudo sincronizar el carrito'
      });
    }
  }
}

module.exports = new CartController();
