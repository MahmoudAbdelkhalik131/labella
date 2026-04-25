import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Package, ShoppingCart, Users, FolderTree, Trash2, CheckCircle, Truck, Edit, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import { money } from "@/components/storefront/ProductCard";
import { useTranslation } from "@/locales/TranslationContext";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const { language } = useTranslation();
  const isAr = language === "AR";
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("products");
  
  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<any>(null);

  // Form states
  const [productForm, setProductForm] = useState({ name: "", description: "", price: 0, quantity: 10, category: "", subcategory: "" });
  const [productCover, setProductCover] = useState<File | null>(null);
  const [productImages, setProductImages] = useState<File[]>([]);
  const [categoryForm, setCategoryForm] = useState({ name: "" });
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [subcategoryForm, setSubcategoryForm] = useState({ name: "", category: "" });

  // Queries
  const products = useQuery({ queryKey: ["admin-products"], queryFn: () => api.get<any>("/products") });
  const orders = useQuery({ queryKey: ["admin-orders"], queryFn: () => api.get<any>("/order") });
  const users = useQuery({ queryKey: ["admin-users"], queryFn: () => api.get<any>("/users") });
  const categories = useQuery({ queryKey: ["admin-categories"], queryFn: () => api.get<any>("/categories") });
  const subcategories = useQuery({ queryKey: ["admin-subcategories"], queryFn: () => api.get<any>("/subcategories") });
  const availableSubcategories = useMemo(
    () => (subcategories.data?.data || []).filter((s: any) => (typeof s.category === "string" ? s.category : s.category?._id) === productForm.category),
    [subcategories.data, productForm.category]
  );

  // Mutations
  const saveProduct = useMutation({
    mutationFn: (data: any) => editingProduct 
      ? api.put(`/products/${editingProduct._id}`, data)
      : api.post("/products", data),
    onSuccess: () => {
      toast.success(editingProduct ? "Product updated" : "Product created");
      setIsProductModalOpen(false);
      setEditingProduct(null);
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => api.del(`/products/${id}`),
    onSuccess: () => {
      toast.success("Product deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });

  const saveCategory = useMutation({
    mutationFn: (data: any) => {
      const isFormData = data instanceof FormData;
      return editingCategory
        ? api.put(`/categories/${editingCategory._id}`, data)
        : api.post("/categories", data);
    },
    onSuccess: () => {
      toast.success(editingCategory ? "Category updated" : "Category created");
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      setCategoryImage(null);
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
  });

  const saveSubcategory = useMutation({
    mutationFn: (data: any) => editingSubcategory
      ? api.put(`/subcategories/${editingSubcategory._id}`, data)
      : api.post("/subcategories", data),
    onSuccess: () => {
      toast.success(editingSubcategory ? "Subcategory updated" : "Subcategory created");
      setIsSubcategoryModalOpen(false);
      setEditingSubcategory(null);
      queryClient.invalidateQueries({ queryKey: ["admin-subcategories"] });
    },
  });

  const updateOrderStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "pay" | "deliver" }) => api.patch(`/order/${id}/${status}`, {}),
    onSuccess: () => {
      toast.success("Order status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });

  const openProductModal = (p?: any) => {
    if (p) {
      setEditingProduct(p);
      setProductForm({ 
        name: p.name, 
        description: p.description || "", 
        price: p.price, 
        quantity: p.quantity, 
        category: typeof p.category === 'string' ? p.category : p.category?._id || "",
        subcategory: typeof p.subcategory === "string" ? p.subcategory : p.subcategory?._id || ""
      });
      setProductCover(null);
      setProductImages([]);
    } else {
      setEditingProduct(null);
      setProductForm({ name: "", description: "", price: 0, quantity: 10, category: "", subcategory: "" });
      setProductCover(null);
      setProductImages([]);
    }
    setIsProductModalOpen(true);
  };

  const submitProduct = () => {
    if (!productForm.name || !productForm.description || !productForm.category || !productForm.subcategory) {
      toast.error(isAr ? "يرجى إكمال كل الحقول المطلوبة." : "Please complete all required fields.");
      return;
    }
    if (editingProduct) {
      saveProduct.mutate(productForm);
      return;
    }

    const formData = new FormData();
    formData.append("name", productForm.name);
    formData.append("description", productForm.description);
    formData.append("price", String(productForm.price));
    formData.append("quantity", String(productForm.quantity));
    formData.append("category", productForm.category);
    formData.append("subcategory", productForm.subcategory);
    if (productCover) formData.append("cover", productCover);
    productImages.forEach((image) => formData.append("images", image));
    saveProduct.mutate(formData);
  };

  const openCategoryModal = (c?: any) => {
    if (c) {
      setEditingCategory(c);
      setCategoryForm({ name: c.name });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: "" });
    }
    setCategoryImage(null);
    setIsCategoryModalOpen(true);
  };

  const submitCategory = () => {
    if (!categoryForm.name) {
      toast.error(isAr ? "يرجى إدخال اسم الفئة." : "Please enter category name.");
      return;
    }
    
    if (categoryImage) {
      const formData = new FormData();
      formData.append("name", categoryForm.name);
      formData.append("image", categoryImage);
      saveCategory.mutate(formData);
    } else {
      saveCategory.mutate(categoryForm);
    }
  };

  const openSubcategoryModal = (s?: any) => {
    if (s) {
      setEditingSubcategory(s);
      setSubcategoryForm({ name: s.name, category: typeof s.category === 'string' ? s.category : s.category?._id || "" });
    } else {
      setEditingSubcategory(null);
      setSubcategoryForm({ name: "", category: "" });
    }
    setIsSubcategoryModalOpen(true);
  };

  return (
    <div className="section-shell py-10" dir={isAr ? "rtl" : "ltr"}>
      <div className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-secondary p-3 text-secondary-foreground shadow-glow">
            <LayoutDashboard className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-secondary">{isAr ? "لوحة الإدارة" : "Admin Dashboard"}</h1>
            <p className="text-muted-foreground">{isAr ? "إدارة منتجاتك وطلباتك وعملائك في مكان واحد." : "Manage your store's products, orders, and users."}</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-[750px] glass-panel">
          <TabsTrigger value="products" className="flex gap-2"><Package className="h-4 w-4" /> {isAr ? "المنتجات" : "Products"}</TabsTrigger>
          <TabsTrigger value="orders" className="flex gap-2"><ShoppingCart className="h-4 w-4" /> {isAr ? "الطلبات" : "Orders"}</TabsTrigger>
          <TabsTrigger value="users" className="flex gap-2"><Users className="h-4 w-4" /> {isAr ? "المستخدمين" : "Users"}</TabsTrigger>
          <TabsTrigger value="categories" className="flex gap-2"><FolderTree className="h-4 w-4" /> {isAr ? "الفئات" : "Categories"}</TabsTrigger>
          <TabsTrigger value="subcategories" className="flex gap-2"><FolderTree className="h-4 w-4 opacity-70" /> {isAr ? "الفئات الفرعية" : "Subcategories"}</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card className="glass-panel border-0 overflow-hidden shadow-warm">
            <CardHeader className="flex flex-row items-center justify-between bg-secondary/5 border-b border-border/50">
              <div>
                <CardTitle>{isAr ? "المنتجات" : "Products"}</CardTitle>
                <CardDescription>{isAr ? "إدارة المخزون وقوائم المنتجات الخاصة بك." : "Manage your inventory and product listings."}</CardDescription>
              </div>
              <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2" onClick={() => openProductModal()}><Plus className="h-4 w-4" /> {isAr ? "إضافة منتج" : "Add Product"}</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] glass-panel">
                  <DialogHeader>
                    <DialogTitle>{editingProduct ? (isAr ? "تعديل المنتج" : "Edit Product") : (isAr ? "إضافة منتج جديد" : "Add New Product")}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">{isAr ? "اسم المنتج" : "Product Name"}</Label>
                      <Input id="name" value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">{isAr ? "الوصف" : "Description"}</Label>
                      <Textarea id="description" value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="price">{isAr ? "السعر" : "Price"}</Label>
                        <Input id="price" type="number" value={productForm.price} onChange={(e) => setProductForm({...productForm, price: Number(e.target.value)})} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="qty">{isAr ? "الكمية" : "Quantity"}</Label>
                        <Input id="qty" type="number" value={productForm.quantity} onChange={(e) => setProductForm({...productForm, quantity: Number(e.target.value)})} />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>{isAr ? "الفئة" : "Category"}</Label>
                      <Select value={productForm.category} onValueChange={(v) => setProductForm({...productForm, category: v, subcategory: ""})}>
                        <SelectTrigger>
                          <SelectValue placeholder={isAr ? "اختر فئة" : "Select category"} />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.data?.data?.map((c: any) => (
                            <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>{isAr ? "الفئة الفرعية" : "Subcategory"}</Label>
                      <Select value={productForm.subcategory} onValueChange={(v) => setProductForm({...productForm, subcategory: v})} disabled={!productForm.category}>
                        <SelectTrigger>
                          <SelectValue placeholder={isAr ? "اختر فئة فرعية" : "Select subcategory"} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSubcategories.map((s: any) => (
                            <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cover">{isAr ? "صورة الغلاف" : "Cover image"}</Label>
                      <Input
                        id="cover"
                        type="file"
                        accept="image/*"
                        disabled={!!editingProduct}
                        onChange={(e) => setProductCover(e.target.files?.[0] || null)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="images">{isAr ? "صور المنتج" : "Product images"}</Label>
                      <Input
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={!!editingProduct}
                        onChange={(e) => setProductImages(Array.from(e.target.files || []))}
                      />
                    </div>
                    {editingProduct && (
                      <p className="text-xs text-muted-foreground">
                        {isAr ? "تحديث الصور متاح فقط عند إنشاء منتج جديد حالياً." : "Image upload is currently supported on new product creation only."}
                      </p>
                    )}
                  </div>
                  <Button className="w-full" onClick={submitProduct}>{isAr ? "حفظ" : "Save Product"}</Button>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="px-6">{isAr ? "المنتج" : "Product"}</TableHead>
                    <TableHead>{isAr ? "الفئة" : "Category"}</TableHead>
                    <TableHead>{isAr ? "السعر" : "Price"}</TableHead>
                    <TableHead>{isAr ? "المخزون" : "Stock"}</TableHead>
                    <TableHead className="text-right px-6">{isAr ? "الإجراءات" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.data?.data?.map((p: any) => (
                    <TableRow key={p._id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="px-6">
                        <div className="flex items-center gap-3">
                          <img src={p.cover || "/placeholder.svg"} className="h-10 w-10 rounded-lg object-cover" />
                          <span className="font-semibold text-secondary">{p.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{typeof p.category === 'string' ? p.category : p.category?.name || "Uncategorized"}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{money(p.price)}</TableCell>
                      <TableCell>
                        <span className={p.quantity < 5 ? "text-destructive font-bold" : ""}>{p.quantity}</span>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openProductModal(p)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => {if(confirm(isAr ? "حذف هذا المنتج؟" : "Delete this product?")) deleteProduct.mutate(p._id)}}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card className="glass-panel border-0 overflow-hidden shadow-warm">
            <CardHeader className="bg-secondary/5 border-b border-border/50">
              <CardTitle>{isAr ? "الطلبات الأخيرة" : "Recent Orders"}</CardTitle>
              <CardDescription>{isAr ? "مراقبة ومعالجة طلبات العملاء." : "Monitor and process customer orders."}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="px-6">{isAr ? "رقم الطلب" : "Order ID"}</TableHead>
                    <TableHead>{isAr ? "المستخدم" : "User"}</TableHead>
                    <TableHead>{isAr ? "الإجمالي" : "Total"}</TableHead>
                    <TableHead>{isAr ? "الدفع" : "Payment"}</TableHead>
                    <TableHead>{isAr ? "التوصيل" : "Delivery"}</TableHead>
                    <TableHead className="text-right px-6">{isAr ? "الإجراءات" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.data?.data?.map((o: any) => (
                    <TableRow key={o._id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="px-6 font-mono text-xs text-muted-foreground">#{o._id.slice(-8).toUpperCase()}</TableCell>
                      <TableCell className="font-medium text-secondary">{o.user?.name || o.user?.username || "Guest"}</TableCell>
                      <TableCell className="font-bold">{money(o.totalPrice)}</TableCell>
                      <TableCell>
                        <Badge variant={o.isPaid ? "default" : "outline"} className={o.isPaid ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
                          {o.isPaid ? (isAr ? "تم الدفع" : "Paid") : (isAr ? "معلق" : "Pending")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={o.isDelivered ? "default" : "secondary"} className={o.isDelivered ? "bg-blue-100 text-blue-700 hover:bg-blue-100" : ""}>
                          {o.isDelivered ? (isAr ? "تم التوصيل" : "Delivered") : (isAr ? "جاري المعالجة" : "Processing")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <div className="flex justify-end gap-2">
                          {!o.isPaid && (
                            <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => updateOrderStatus.mutate({ id: o._id, status: "pay" })}>
                              <CheckCircle className="h-3 w-3" /> {isAr ? "دفع" : "Pay"}
                            </Button>
                          )}
                          {!o.isDelivered && (
                            <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => updateOrderStatus.mutate({ id: o._id, status: "deliver" })}>
                              <Truck className="h-3 w-3" /> {isAr ? "توصيل" : "Deliver"}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!orders.data?.data || orders.data.data.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">{isAr ? "لا توجد طلبات بعد." : "No orders found."}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="glass-panel border-0 overflow-hidden shadow-warm">
            <CardHeader className="bg-secondary/5 border-b border-border/50">
              <CardTitle>{isAr ? "إدارة المستخدمين" : "User Management"}</CardTitle>
              <CardDescription>{isAr ? "عرض وإدارة حسابات المستخدمين وأدوارهم." : "View and manage user accounts and roles."}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="px-6">{isAr ? "الاسم" : "Name"}</TableHead>
                    <TableHead>{isAr ? "البريد الإلكتروني" : "Email"}</TableHead>
                    <TableHead>{isAr ? "الدور" : "Role"}</TableHead>
                    <TableHead>{isAr ? "الحالة" : "Status"}</TableHead>
                    <TableHead className="text-right px-6">{isAr ? "الإجراءات" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.data?.data?.map((u: any) => (
                    <TableRow key={u._id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">{(u.name || u.username || "?")[0].toUpperCase()}</div>
                          <span className="font-medium text-secondary">{u.name || u.username}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={cn("h-2 w-2 rounded-full", u.active ? "bg-green-500" : "bg-red-500")} />
                          {u.active ? (isAr ? "نشط" : "Active") : (isAr ? "غير نشط" : "Inactive")}
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <Button variant="ghost" size="sm" disabled={u.role === "admin"}>{isAr ? "تعديل الدور" : "Edit Role"}</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card className="glass-panel border-0 overflow-hidden shadow-warm">
            <CardHeader className="flex flex-row items-center justify-between bg-secondary/5 border-b border-border/50">
              <div>
                <CardTitle>{isAr ? "الفئات" : "Categories"}</CardTitle>
                <CardDescription>{isAr ? "تنظيم منتجاتك باستخدام الفئات." : "Organize your products with categories."}</CardDescription>
              </div>
              <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2" onClick={() => openCategoryModal()}><Plus className="h-4 w-4" /> {isAr ? "فئة جديدة" : "New Category"}</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px] glass-panel">
                  <DialogHeader>
                    <DialogTitle>{editingCategory ? (isAr ? "تعديل الفئة" : "Edit Category") : (isAr ? "إضافة فئة جديدة" : "Add New Category")}</DialogTitle>
                  </DialogHeader>
                   <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="cat-name">{isAr ? "اسم الفئة" : "Category Name"}</Label>
                      <Input id="cat-name" value={categoryForm.name} onChange={(e) => setCategoryForm({name: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cat-image">{isAr ? "الصورة" : "Image"}</Label>
                      <Input 
                        id="cat-image" 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setCategoryImage(e.target.files?.[0] || null)} 
                      />
                    </div>
                  </div>
                  <Button className="w-full" onClick={submitCategory}>{isAr ? "حفظ" : "Save Category"}</Button>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="px-6">{isAr ? "الاسم" : "Name"}</TableHead>
                    <TableHead>{isAr ? "المنتجات" : "Products"}</TableHead>
                    <TableHead className="text-right px-6">{isAr ? "الإجراءات" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   {categories.data?.data?.map((c: any) => (
                    <TableRow key={c._id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="px-6 font-semibold text-secondary">
                        <div className="flex items-center gap-3">
                          <img src={api.imgUrl(c.image)} className="h-8 w-8 rounded object-cover" />
                          {c.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">0</Badge>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openCategoryModal(c)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => {if(confirm(isAr ? "حذف هذه الفئة؟" : "Delete this category?")) api.del(`/categories/${c._id}`).then(()=>queryClient.invalidateQueries({queryKey:["admin-categories"]}))}}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="subcategories">
          <Card className="glass-panel border-0 overflow-hidden shadow-warm">
            <CardHeader className="flex flex-row items-center justify-between bg-secondary/5 border-b border-border/50">
              <div>
                <CardTitle>{isAr ? "الفئات الفرعية" : "Subcategories"}</CardTitle>
                <CardDescription>{isAr ? "تنظيم أعمق لمنتجاتك." : "Deepen your product organization."}</CardDescription>
              </div>
              <Dialog open={isSubcategoryModalOpen} onOpenChange={setIsSubcategoryModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2" onClick={() => openSubcategoryModal()}><Plus className="h-4 w-4" /> {isAr ? "فئة فرعية جديدة" : "New Subcategory"}</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px] glass-panel">
                  <DialogHeader>
                    <DialogTitle>{editingSubcategory ? (isAr ? "تعديل الفئة الفرعية" : "Edit Subcategory") : (isAr ? "إضافة فئة فرعية جديدة" : "Add New Subcategory")}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="sub-name">{isAr ? "الاسم" : "Name"}</Label>
                      <Input id="sub-name" value={subcategoryForm.name} onChange={(e) => setSubcategoryForm({...subcategoryForm, name: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                      <Label>{isAr ? "الفئة الرئيسية" : "Parent Category"}</Label>
                      <Select value={subcategoryForm.category} onValueChange={(v) => setSubcategoryForm({...subcategoryForm, category: v})}>
                        <SelectTrigger>
                          <SelectValue placeholder={isAr ? "اختر فئة" : "Select category"} />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.data?.data?.map((c: any) => (
                            <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button className="w-full" onClick={() => saveSubcategory.mutate(subcategoryForm)}>{isAr ? "حفظ" : "Save Subcategory"}</Button>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="px-6">{isAr ? "الاسم" : "Name"}</TableHead>
                    <TableHead>{isAr ? "الفئة الرئيسية" : "Parent Category"}</TableHead>
                    <TableHead className="text-right px-6">{isAr ? "الإجراءات" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subcategories.data?.data?.map((s: any) => (
                    <TableRow key={s._id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="px-6 font-semibold text-secondary">{s.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{typeof s.category === 'string' ? s.category : s.category?.name || "None"}</Badge>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openSubcategoryModal(s)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => {if(confirm(isAr ? "حذف هذه الفئة الفرعية؟" : "Delete this subcategory?")) api.del(`/subcategories/${s._id}`).then(()=>queryClient.invalidateQueries({queryKey:["admin-subcategories"]}))}}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

