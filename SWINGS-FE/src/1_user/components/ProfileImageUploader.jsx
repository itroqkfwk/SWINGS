import { useEffect, useState } from "react";
import { UserCircle, X } from "lucide-react";
import { deleteProfileImage, getProfileImageUrl, updateProfileImage } from "../api/userApi";
import { toast } from "react-toastify";

export default function ProfileImageUploader({
  imageFile,
  setImageFile,
  initialImage,
  onClose,
  onComplete,
}) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    if (initialImage) {
      setPreviewUrl(getProfileImageUrl(initialImage));
      return;
    }

    setPreviewUrl(null);
  }, [imageFile, initialImage]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      return;
    }

    alert("이미지 파일만 업로드 가능합니다.");
    setImageFile(null);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
  };

  const handleSave = async () => {
    if (!imageFile) {
      setIsSaving(true);
      try {
        await deleteProfileImage();
        toast.success("기본 이미지로 저장되었습니다.");
        onComplete?.(null);
        onClose();
        window.location.reload();
      } catch (err) {
        console.error("기본 이미지 저장 실패:", err);
        toast.error("기본 이미지 저장에 실패했습니다.");
      } finally {
        setIsSaving(false);
      }
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateProfileImage(imageFile);
      toast.success("프로필 이미지가 저장되었습니다.");
      onComplete?.(res.filename);
      onClose();
      window.location.reload();
    } catch (err) {
      console.error("업로드 실패:", err);
      toast.error("업로드에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative w-[90%] max-w-sm rounded-2xl bg-white p-6 shadow-lg">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-500 hover:text-black"
      >
        <X size={20} />
      </button>

      <div className="relative mx-auto h-36 w-36">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="프로필 이미지 미리보기"
            className="h-36 w-36 rounded-full border-2 border-gray-300 object-cover shadow-lg transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex h-36 w-36 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50 shadow-lg">
            <UserCircle className="text-gray-300" size={92} />
          </div>
        )}
        <button
          onClick={handleRemoveImage}
          className="absolute -right-2 -top-2 rounded-full border border-gray-300 bg-white p-1 text-gray-500 shadow-sm transition hover:bg-red-500 hover:text-white"
        >
          <X size={14} />
        </button>
      </div>

      <label className="mx-auto mt-4 block cursor-pointer rounded-full bg-custom-purple px-6 py-2 text-center text-sm font-bold text-white shadow-md transition hover:opacity-90">
        이미지 선택
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      </label>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="mt-6 w-full rounded-full bg-custom-pink py-2 text-sm font-bold text-white transition disabled:opacity-50"
      >
        {isSaving ? "저장 중..." : "저장하기"}
      </button>
    </div>
  );
}
