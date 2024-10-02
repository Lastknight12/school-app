import { IoMdAdd, IoMdRemove } from "react-icons/io";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import UploadImage from "./UploadImage";
import { useUpdateProduct } from "~/lib/state";

export function UpdateProduct() {
  const {
    newTitle: name,
    newCount: count,
    newImageSrc: imageSrc,
    newPrice: price,
  } = useUpdateProduct((state) => state.product);
  const updateTitle = useUpdateProduct((state) => state.updateTitle);
  const updateCount = useUpdateProduct((state) => state.updateCount);
  const updateImageSrc = useUpdateProduct((state) => state.updateImageSrc);
  const updatePrice = useUpdateProduct((state) => state.updatePrice);

  function incrementPrice() {
    updatePrice(price + 1);
  }

  function decrementPrice() {
    if (price > 1) updatePrice(price - 1);
  }

  return (
    <div className="grid gap-3 py-4">
      <div className="grid grid-cols-3 items-center">
        {/* NAME */}
        <Label className="text-left text-base">Назва:</Label>
        <input
          className="col-span-2 rounded-md border-card bg-card px-3 py-1 outline-none"
          type="text"
          value={name}
          onChange={(e) => updateTitle(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-3 items-center">
        {/* COUNT */}
        <Label className="text-left text-base">Кількість</Label>
        <div className="grid grid-cols-3 items-center justify-center">
          <IoMdRemove
            size={35}
            onClick={() => updateCount(count - 1)}
            className={cn(count === 0 && "opacity-50")}
            style={{ width: "100%" }}
          />
          <input
            className="bg-transparent text-center text-xl outline-none"
            value={count}
            onChange={(e) => {
              // check if number not NaN and <= 999
              const maxValue = 999;
              const value = Number(e.target.value);
              if (!isNaN(value) && value <= maxValue) updateCount(value);
            }}
            style={{ width: "100%" }}
          />
          <IoMdAdd
            size={35}
            onClick={() => updateCount(count + 1)}
            style={{ width: "100%" }}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 items-center">
        {/* PRICE */}
        <Label className="text-left text-base">Ціна</Label>
        <div className="grid grid-cols-3 items-center justify-center">
          <IoMdRemove
            size={35}
            onClick={decrementPrice}
            className={cn(price === 1 && "opacity-50")}
            style={{ width: "100%" }}
          />
          <input
            className="bg-transparent text-center text-xl outline-none"
            value={price}
            onChange={(e) => {
              // check if number not NaN and <= 999
              const maxValue = 999;
              const value = Number(e.target.value);
              if (!isNaN(value) && value <= maxValue) updatePrice(value);
            }}
            style={{ width: "100%" }}
          />
          <IoMdAdd
            size={35}
            onClick={incrementPrice}
            style={{ width: "100%" }}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 items-center">
        {/* IMAGE */}
        <Label className="text-left text-base">Картинка</Label>
        <UploadImage onSuccess={updateImageSrc} defaultSrc={imageSrc} />
      </div>
    </div>
  );
}
