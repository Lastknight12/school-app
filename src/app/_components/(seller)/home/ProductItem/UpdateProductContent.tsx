import { useUpdateProduct } from "~/lib/state";

import UploadImage from "../../../shared/UploadImage";

import Counter from "~/shadcn/ui/counter";
import { Input } from "~/shadcn/ui/input";
import { Label } from "~/shadcn/ui/label";

interface Props {
  defaultImageSrc: string;
}

export function UpdateProduct({ defaultImageSrc }: Props) {
  const {
    newTitle: name,
    newCount: count,
    newPrice: price,
  } = useUpdateProduct((state) => state.product);
  const updateTitle = useUpdateProduct((state) => state.updateTitle);
  const updateCount = useUpdateProduct((state) => state.updateCount);
  const updateImageSrc = useUpdateProduct((state) => state.updateImageSrc);
  const updatePrice = useUpdateProduct((state) => state.updatePrice);

  return (
    <div className="grid gap-3 py-4">
      <div className="grid grid-cols-3 items-center">
        {/* NAME */}
        <Label className="text-left text-base">Назва:</Label>
        <Input
          variant="accent"
          className="col-span-2"
          type="text"
          value={name}
          onChange={(e) => updateTitle(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-3 items-center">
        {/* COUNT */}
        <Label className="text-left text-base">Кількість</Label>
        <Counter
          value={count}
          onValueChange={updateCount}
          maxIncrementRange={999}
        />
      </div>

      <div className="grid grid-cols-3 items-center">
        {/* PRICE */}
        <Label className="text-left text-base">Ціна</Label>
        <Counter
          value={price}
          onValueChange={updatePrice}
          maxIncrementRange={999}
        />
      </div>

      <div className="grid grid-cols-3 items-center">
        {/* IMAGE */}
        <Label className="text-left text-base">Картинка</Label>
        <UploadImage
          onSuccess={updateImageSrc}
          defaultImageSrc={defaultImageSrc}
        />
      </div>
    </div>
  );
}
