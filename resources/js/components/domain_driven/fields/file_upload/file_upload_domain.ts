// import { ObservableValue } from '@/hex/observable_value';
// import { toast } from 'sonner';
// import { Media } from '../../../../../ts/item/item_proto_response_interfaces';
// import { destroyMedia, storeMedia } from '../../../../../ts/media/media_api_client';

// interface PreviewFile extends File {
//   preview: string;
// }
export class FileUploadDomain {
  //   onSuccessUpload: (media: Media[]) => void;
  //   removeImage: (media: Media) => void;
  //   files: ObservableValue<PreviewFile[]> = new ObservableValue<PreviewFile[]>([]);
  //   internalErrors: ObservableValue<string | null> = new ObservableValue<string | null>(null);
  //   mediaPreview: ObservableValue<string | null> = new ObservableValue<string | null>(null);
  //   constructor(onSuccessUpload: (media: Media[]) => void, removeImage: (media: Media) => void) {
  //     this.onSuccessUpload = onSuccessUpload;
  //     this.removeImage = removeImage;
  //   }
  //   setFiles(files: PreviewFile[]) {
  //     this.files.setValue(files);
  //   }
  //   setInternalErrors(errors: string | null) {
  //     this.internalErrors.setValue(errors);
  //   }
  //   setMediaPreview(mediaPreview: string | null) {
  //     this.mediaPreview.setValue(mediaPreview);
  //   }
  //   async uploadImages(file: File | File[] | null, model: string) {
  //     if (!file) {
  //       return;
  //     }
  //     const formData = new FormData();
  //     if (Array.isArray(file)) {
  //       file.forEach((f) => {
  //         formData.append('files[]', f);
  //       });
  //     } else {
  //       formData.append('files', file);
  //     }
  //     formData.append('model', model);
  //     await storeMedia(formData)
  //       .then((res) => this.onSuccessUpload(res))
  //       .catch((err) => toast.error(err.response.data.message));
  //   }
  //   async deleteImage(media: Media) {
  //     if (!media.original_path.startsWith('data:image')) {
  //       await destroyMedia({ id: media.id })
  //         .then((_) => this.removeImage(media))
  //         .catch((err) => toast.error(err.response.data.message));
  //     } else {
  //       this.removeImage(media);
  //     }
  //   }
}
