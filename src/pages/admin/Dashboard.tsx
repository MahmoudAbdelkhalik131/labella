import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  Trash2,
  CheckCircle,
  Truck,
  Edit,
  LayoutDashboard,
  Eye,
} from "lucide-react";
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
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "" as number | string,
    quantity: 10 as number | string,
    category: "",
    subcategory: "",
    size: "",
  });
  const [productCover, setProductCover] = useState<File | null>(null);
  const [productImages, setProductImages] = useState<File[]>([]);
  const [categoryForm, setCategoryForm] = useState({ name: "" });
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [subcategoryForm, setSubcategoryForm] = useState({
    name: "",
    category: "",
  });
  const [subcategoryImage, setSubcategoryImage] = useState<File | null>(null);

  // Queries
  const products = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => api.get<any>("/products"),
  });
  const orders = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => api.get<any>("/order"),
  });
  const users = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api.get<any>("/users"),
  });
  const categories = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => api.get<any>("/categories"),
  });
  const subcategories = useQuery({
    queryKey: ["admin-subcategories"],
    queryFn: () => api.get<any>("/subcategories"),
  });
  const availableSubcategories = useMemo(
    () =>
      (subcategories.data?.data || []).filter(
        (s: any) =>
          (typeof s.category === "string" ? s.category : s.category?._id) ===
          productForm.category,
      ),
    [subcategories.data, productForm.category],
  );

  // Mutations
  const saveProduct = useMutation({
    mutationFn: (data: any) =>
      editingProduct
        ? api.put(`/products/${editingProduct._id}`, data)
        : api.post("/products", data),
    onSuccess: () => {
      toast.success(editingProduct ? "تم تحديث المنتج" : "تم إضافة المنتج");
      setIsProductModalOpen(false);
      setEditingProduct(null);
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => api.del(`/products/${id}`),
    onSuccess: () => {
      toast.success("تم حذف المنتج");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });

  const saveCategory = useMutation({
    mutationFn: (data: any) => {
      return editingCategory
        ? api.put(`/categories/${editingCategory._id}`, data)
        : api.post("/categories", data);
    },
    onSuccess: () => {
      toast.success(editingCategory ? "تم تحديث القسم" : "تم إضافة القسم");
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      setCategoryImage(null);
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
  });

  const saveSubcategory = useMutation({
    mutationFn: (data: any) =>
      editingSubcategory
        ? api.put(`/subcategories/${editingSubcategory._id}`, data)
        : api.post("/subcategories", data),
    onSuccess: () => {
      toast.success(
        editingSubcategory ? "تم تحديث القسم الفرعي" : "تم إضافة القسم الفرعي",
      );
      setIsSubcategoryModalOpen(false);
      setEditingSubcategory(null);
      queryClient.invalidateQueries({ queryKey: ["admin-subcategories"] });
    },
  });

  const updateOrderStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "pay" | "deliver" }) =>
      api.patch(`/order/${id}/${status}`, {}),
    onSuccess: () => {
      toast.success("تم تحديث حالة الطلب");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });

  const updateDepositStatus = useMutation({
    mutationFn: (id: string) => api.patch(`/order/${id}/deposite`, {}),
    onSuccess: () => {
      toast.success("تم تأكيد دفع الديبوزت");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => api.del(`/users/${id}`),
    onSuccess: () => {
      toast.success("تم حذف المستخدم");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const openProductModal = (p?: any) => {
    if (p) {
      setEditingProduct(p);
      setProductForm({
        name: p.name,
        size: p.size || "",
        description: p.description || "",
        price: p.price,
        quantity: p.quantity,
        category:
          typeof p.category === "string" ? p.category : p.category?._id || "",
        subcategory:
          typeof p.subcategory === "string"
            ? p.subcategory
            : p.subcategory?._id || "",
      });
      setProductCover(null);
      setProductImages([]);
    } else {
      setEditingProduct(null);
      setProductForm({
        name: "",
        size: "",
        description: "",
        price: "",
        quantity: 10,
        category: "",
        subcategory: "",
      });
      setProductCover(null);
      setProductImages([]);
    }
    setIsProductModalOpen(true);
  };

  const submitProduct = () => {
    const isSizeRequired = !editingProduct;
    if (
      !productForm.name ||
      (isSizeRequired && !productForm.size) ||
      !productForm.description ||
      !productForm.category ||
      !productForm.subcategory
    ) {
      toast.error("يرجى إكمال كل الحقول المطلوبة.");
      return;
    }

    const formData = new FormData();
    formData.append("name", productForm.name);
    formData.append("description", productForm.description);
    if (productForm.size) {
      formData.append("size", productForm.size);
    }
    formData.append("price", String(productForm.price));
    formData.append("quantity", String(productForm.quantity));
    formData.append("category", productForm.category);
    formData.append("subcategory", productForm.subcategory);

    if (productCover) formData.append("cover", productCover);
    productImages.forEach((image) => formData.append("images", image));

    // If we're editing and NO new images are selected, we can send just the JSON or use FormData without images
    // The backend updateOne usually handles both.
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
      toast.error("يرجى إدخال اسم الفئة.");
      return;
    }

    const formData = new FormData();
    formData.append("name", categoryForm.name);
    if (categoryImage) {
      formData.append("image", categoryImage);
    }

    saveCategory.mutate(formData);
  };

  const openSubcategoryModal = (s?: any) => {
    if (s) {
      setEditingSubcategory(s);
      setSubcategoryForm({
        name: s.name,
        category:
          typeof s.category === "string" ? s.category : s.category?._id || "",
      });
    } else {
      setEditingSubcategory(null);
      setSubcategoryForm({ name: "", category: "" });
    }
    setSubcategoryImage(null);
    setIsSubcategoryModalOpen(true);
  };

  const submitSubcategory = () => {
    if (!subcategoryForm.name || !subcategoryForm.category) {
      toast.error("يرجى إكمال كل الحقول المطلوبة.");
      return;
    }

    const formData = new FormData();
    formData.append("name", subcategoryForm.name);
    formData.append("category", subcategoryForm.category);
    if (subcategoryImage) {
      formData.append("image", subcategoryImage);
    }

    saveSubcategory.mutate(formData);
  };

  return (
    <div className="section-shell py-10" dir={"rtl"}>
      <div className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-secondary p-3 text-secondary-foreground shadow-glow">
            <LayoutDashboard className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-secondary">
              {"لوحة الإدارة"}
            </h1>
            <p className="text-sm text-muted-foreground hidden sm:block">
              {"إدارة منتجاتك وطلباتك وعملائك في مكان واحد."}
            </p>
          </div>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <div className="overflow-x-auto pb-2">
          <TabsList className="flex w-max lg:w-[750px] glass-panel">
            <TabsTrigger
              value="products"
              className="flex gap-2 whitespace-nowrap"
            >
              <Package className="h-4 w-4" /> {"المنتجات"}
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="flex gap-2 whitespace-nowrap"
            >
              <ShoppingCart className="h-4 w-4" /> {"الطلبات"}
            </TabsTrigger>
            <TabsTrigger value="users" className="flex gap-2 whitespace-nowrap">
              <Users className="h-4 w-4" /> {"المستخدمين"}
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="flex gap-2 whitespace-nowrap"
            >
              <FolderTree className="h-4 w-4" /> {"الفئات"}
            </TabsTrigger>
            <TabsTrigger
              value="subcategories"
              className="flex gap-2 whitespace-nowrap"
            >
              <FolderTree className="h-4 w-4 opacity-70" /> {"الفئات الفرعية"}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="products">
          <Card className="glass-panel border-0 overflow-hidden shadow-warm">
            <CardHeader className="flex flex-row items-center justify-between bg-secondary/5 border-b border-border/50 p-4 md:p-6">
              <div>
                <CardTitle className="text-lg md:text-xl">
                  {"المنتجات"}
                </CardTitle>
                <CardDescription className="hidden sm:block">
                  {"إدارة المخزون وقوائم المنتجات الخاصة بك."}
                </CardDescription>
              </div>
              <Dialog
                open={isProductModalOpen}
                onOpenChange={setIsProductModalOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    className="gap-2"
                    size="sm"
                    onClick={() => openProductModal()}
                  >
                    <Plus className="h-4 w-4" /> {"إضافة"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] glass-panel max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">{"اسم المنتج"}</Label>
                      <Input
                        id="name"
                        value={productForm.name}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="size">{"حجم العبوة"}</Label>
                      <Input
                        id="size"
                        value={productForm.size}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            size: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">{"الوصف"}</Label>
                      <Textarea
                        id="description"
                        value={productForm.description}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="price">{"السعر"}</Label>
                        <Input
                          id="price"
                          type="number"
                          value={productForm.price}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              price:
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="qty">{"الكمية"}</Label>
                        <Input
                          id="qty"
                          type="number"
                          value={productForm.quantity}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              quantity:
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>{"الفئة"}</Label>
                      <Select
                        value={productForm.category}
                        onValueChange={(v) =>
                          setProductForm({
                            ...productForm,
                            category: v,
                            subcategory: "",
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={"اختر فئة"} />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.data?.data?.map((c: any) => (
                            <SelectItem key={c._id} value={c._id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>{"الفئة الفرعية"}</Label>
                      <Select
                        value={productForm.subcategory}
                        onValueChange={(v) =>
                          setProductForm({ ...productForm, subcategory: v })
                        }
                        disabled={!productForm.category}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={"اختر فئة فرعية"} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSubcategories.map((s: any) => (
                            <SelectItem key={s._id} value={s._id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cover">{"صورة الغلاف"}</Label>
                      <Input
                        id="cover"
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setProductCover(e.target.files?.[0] || null)
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="images">{"صور إضافية"}</Label>
                      <Input
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) =>
                          setProductImages(Array.from(e.target.files || []))
                        }
                      />
                    </div>
                  </div>
                  <Button className="w-full" onClick={submitProduct}>
                    {"حفظ"}
                  </Button>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="px-6">{"المنتج"}</TableHead>
                    <TableHead>{"الفئة"}</TableHead>
                    <TableHead>{"السعر"}</TableHead>
                    <TableHead>{"المخزون"}</TableHead>
                    <TableHead className="text-right px-6">
                      {"الإجراءات"}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.data?.data?.map((p: any) => (
                    <TableRow
                      key={p._id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <TableCell className="px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={api.imgUrl(p.cover)}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                          <span className="font-semibold text-secondary text-sm">
                            {p.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {typeof p.category === "string"
                            ? p.category
                            : p.category?.name || "Uncategorized"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {money(p.price)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "text-sm",
                            p.quantity < 5 ? "text-destructive font-bold" : "",
                          )}
                        >
                          {p.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openProductModal(p)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              if (confirm("حذف هذا المنتج؟"))
                                deleteProduct.mutate(p._id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
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
            <CardHeader className="bg-secondary/5 border-b border-border/50 p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl">
                {"الطلبات الأخيرة"}
              </CardTitle>
              <CardDescription className="hidden sm:block">
                {"مراقبة ومعالجة طلبات العملاء."}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="px-6">{"رقم الطلب"}</TableHead>
                    <TableHead>{"المستخدم"}</TableHead>
                    <TableHead>{"الإجمالي"}</TableHead>
                    <TableHead>{"الدفع"}</TableHead>
                    <TableHead>{"الديبوزت"}</TableHead>
                    <TableHead>{"التوصيل"}</TableHead>
                    <TableHead className="text-right px-6">
                      {"الإجراءات"}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.data?.data?.map((o: any) => (
                    <TableRow
                      key={o._id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <TableCell className="px-6 font-mono text-xs text-muted-foreground">
                        #{o._id.slice(-8).toUpperCase()}
                      </TableCell>
                      <TableCell className="font-medium text-secondary text-sm">
                        <div>{o.user?.name || o.user?.username || "Guest"}</div>
                        {o.user?.phone && (
                          <div className="text-xs text-muted-foreground font-mono mt-0.5">
                            {o.user.phone}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-bold text-sm">
                        {money(o.totalPrice)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={o.isPaid ? "default" : "outline"}
                          className={cn(
                            "text-[10px]",
                            o.isPaid
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : "",
                          )}
                        >
                          {o.isPaid ? "تم الدفع" : "معلق"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {o.DepositeAmount != null ? (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px]",
                              o.isDepositePaid
                                ? "border-green-200 text-green-700 bg-green-50"
                                : "border-orange-200 text-orange-700 bg-orange-50",
                            )}
                          >
                            {o.isDepositePaid ? "ديبوزت مدفوع" : "ديبوزت معلق"}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={o.isDelivered ? "default" : "secondary"}
                          className={cn(
                            "text-[10px]",
                            o.isDelivered
                              ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                              : "",
                          )}
                        >
                          {o.isDelivered ? "تم التوصيل" : "جاري المعالجة"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            asChild
                            title={"عرض التفاصيل"}
                          >
                            <Link to={`/orders/${o._id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          {!o.isPaid && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1 text-xs"
                              onClick={() =>
                                updateOrderStatus.mutate({
                                  id: o._id,
                                  status: "pay",
                                })
                              }
                            >
                              <CheckCircle className="h-3 w-3" /> {"دفع"}
                            </Button>
                          )}
                          {!o.isDelivered && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1 text-xs"
                              onClick={() =>
                                updateOrderStatus.mutate({
                                  id: o._id,
                                  status: "deliver",
                                })
                              }
                            >
                              <Truck className="h-3 w-3" /> {"توصيل"}
                            </Button>
                          )}
                          {!o.isDepositePaid && o.DepositeAmount != null && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1 text-xs border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                              onClick={() => updateDepositStatus.mutate(o._id)}
                            >
                              <CheckCircle className="h-3 w-3" />{" "}
                              {"تأكيد الديبوزت"}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!orders.data?.data || orders.data.data.length === 0) && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-32 text-center text-muted-foreground"
                      >
                        {"لا توجد طلبات بعد."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="glass-panel border-0 overflow-hidden shadow-warm">
            <CardHeader className="bg-secondary/5 border-b border-border/50 p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl">
                {"إدارة المستخدمين"}
              </CardTitle>
              <CardDescription className="hidden sm:block">
                {"عرض وإدارة حسابات المستخدمين وأدوارهم."}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table className="min-w-[700px]">
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="px-6">{"الاسم"}</TableHead>
                    <TableHead>{"البريد الإلكتروني"}</TableHead>
                    <TableHead>{"الدور"}</TableHead>
                    <TableHead>{"الحالة"}</TableHead>
                    <TableHead className="text-right px-6">
                      {"الإجراءات"}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.data?.data?.map((u: any) => (
                    <TableRow
                      key={u._id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <TableCell className="px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs">
                            {(u.name || u.username || "?")[0].toUpperCase()}
                          </div>
                          <span className="font-medium text-secondary text-sm">
                            {u.name || u.username}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {u.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={u.role === "admin" ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs">
                          <div
                            className={cn(
                              "h-2 w-2 rounded-full",
                              u.active ? "bg-green-500" : "bg-red-500",
                            )}
                          />
                          {u.active ? "نشط" : "غير نشط"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={u.role === "admin"}
                          onClick={() => {
                            if (confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
                              deleteUser.mutate(u._id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
            <CardHeader className="flex flex-row items-center justify-between bg-secondary/5 border-b border-border/50 p-4 md:p-6">
              <div>
                <CardTitle className="text-lg md:text-xl">{"الفئات"}</CardTitle>
                <CardDescription className="hidden sm:block">
                  {"تنظيم منتجاتك باستخدام الفئات."}
                </CardDescription>
              </div>
              <Dialog
                open={isCategoryModalOpen}
                onOpenChange={setIsCategoryModalOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => openCategoryModal()}
                  >
                    <Plus className="h-4 w-4" /> {"جديد"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px] glass-panel">
                  <DialogHeader>
                    <DialogTitle>
                      {editingCategory ? "تعديل الفئة" : "إضافة فئة جديدة"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="cat-name">{"اسم الفئة"}</Label>
                      <Input
                        id="cat-name"
                        value={categoryForm.name}
                        onChange={(e) =>
                          setCategoryForm({ name: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cat-image">{"صورة الفئة"}</Label>
                      <Input
                        id="cat-image"
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setCategoryImage(e.target.files?.[0] || null)
                        }
                      />
                    </div>
                  </div>
                  <Button className="w-full" onClick={submitCategory}>
                    {"حفظ"}
                  </Button>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table className="min-w-[500px]">
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="px-6">{"الاسم"}</TableHead>
                    <TableHead>{"المنتجات"}</TableHead>
                    <TableHead className="text-right px-6">
                      {"الإجراءات"}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.data?.data?.map((c: any) => (
                    <TableRow
                      key={c._id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <TableCell className="px-6 font-semibold text-secondary text-sm">
                        <div className="flex items-center gap-3">
                          <img
                            src={api.imgUrl(c.image)}
                            className="h-8 w-8 rounded object-cover"
                          />
                          {c.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          0
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openCategoryModal(c)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              if (confirm("حذف هذه الفئة؟"))
                                api
                                  .del(`/categories/${c._id}`)
                                  .then(() =>
                                    queryClient.invalidateQueries({
                                      queryKey: ["admin-categories"],
                                    }),
                                  );
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
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
            <CardHeader className="flex flex-row items-center justify-between bg-secondary/5 border-b border-border/50 p-4 md:p-6">
              <div>
                <CardTitle className="text-lg md:text-xl">
                  {"الفئات الفرعية"}
                </CardTitle>
                <CardDescription className="hidden sm:block">
                  {"تنظيم أعمق لمنتجاتك."}
                </CardDescription>
              </div>
              <Dialog
                open={isSubcategoryModalOpen}
                onOpenChange={setIsSubcategoryModalOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => openSubcategoryModal()}
                  >
                    <Plus className="h-4 w-4" /> {"جديد"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px] glass-panel">
                  <DialogHeader>
                    <DialogTitle>
                      {editingSubcategory
                        ? "تعديل الفئة الفرعية"
                        : "إضافة فئة فرعية جديدة"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="sub-name">{"الاسم"}</Label>
                      <Input
                        id="sub-name"
                        value={subcategoryForm.name}
                        onChange={(e) =>
                          setSubcategoryForm({
                            ...subcategoryForm,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>{"الفئة الرئيسية"}</Label>
                      <Select
                        value={subcategoryForm.category}
                        onValueChange={(v) =>
                          setSubcategoryForm({
                            ...subcategoryForm,
                            category: v,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={"اختر فئة"} />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.data?.data?.map((c: any) => (
                            <SelectItem key={c._id} value={c._id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="sub-image">{"صورة الفئة الفرعية"}</Label>
                      <Input
                        id="sub-image"
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setSubcategoryImage(e.target.files?.[0] || null)
                        }
                      />
                    </div>
                  </div>
                  <Button className="w-full" onClick={submitSubcategory}>
                    {"حفظ"}
                  </Button>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table className="min-w-[500px]">
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="px-6">{"الاسم"}</TableHead>
                    <TableHead>{"الفئة الرئيسية"}</TableHead>
                    <TableHead className="text-right px-6">
                      {"الإجراءات"}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subcategories.data?.data?.map((s: any) => (
                    <TableRow
                      key={s._id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <TableCell className="px-6 font-semibold text-secondary text-sm">
                        <div className="flex items-center gap-3">
                          <img
                            src={api.imgUrl(s.image)}
                            className="h-8 w-8 rounded object-cover"
                          />
                          {s.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {typeof s.category === "string"
                            ? s.category
                            : s.category?.name || "None"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openSubcategoryModal(s)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              if (confirm("حذف هذه الفئة الفرعية؟"))
                                api
                                  .del(`/subcategories/${s._id}`)
                                  .then(() =>
                                    queryClient.invalidateQueries({
                                      queryKey: ["admin-subcategories"],
                                    }),
                                  );
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
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
