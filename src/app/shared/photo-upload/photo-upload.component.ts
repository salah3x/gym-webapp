import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  Input
} from '@angular/core';
import {
  AngularFireStorageReference,
  AngularFireUploadTask,
  AngularFireStorage
} from '@angular/fire/storage';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-photo-upload',
  templateUrl: './photo-upload.component.html',
  styleUrls: ['./photo-upload.component.css']
})
export class PhotoUploadComponent implements OnInit, OnDestroy {
  @Output() start = new EventEmitter<void>();
  @Output() end = new EventEmitter<string>();
  @Input() deleteOnClose = true;

  @ViewChild('i18n') public i18n: ElementRef;

  photoUrl = '';
  isUploading = false;
  downloadUrl: string;
  uploadPct = 0;
  isPaused = false;
  fileRef: AngularFireStorageReference;
  task: AngularFireUploadTask;

  private ngUnsubscribe = new Subject();

  constructor(
    private storage: AngularFireStorage,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {}

  uploadPhoto(event: Event) {
    this.start.emit();
    const file = (event.target as HTMLInputElement).files[0];
    if (!file) {
      return;
    }
    this.isUploading = true;
    const filePath = 'images/' + Date.now().valueOf() + file.name;
    this.task = this.storage.upload(filePath, file);
    this.task
      .percentageChanges()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(pct => (this.uploadPct = pct));
    this.task
      .then(t => {
        this.photoUrl = t.ref.fullPath;
        this.fileRef = this.storage.ref(this.photoUrl);
        this.fileRef
          .getDownloadURL()
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(url => (this.downloadUrl = url));
        this.snack.open(
          this.i18n.nativeElement.childNodes[0].textContent,
          'X',
          { duration: 3000 }
        );
        this.end.emit(this.photoUrl);
        this.isUploading = false;
      })
      .catch(() => {
        this.snack.open(
          this.i18n.nativeElement.childNodes[1].textContent,
          'X',
          { duration: 3000 }
        );
        this.end.emit('');
        this.isUploading = false;
      });
    (event.target as HTMLInputElement).value = '';
  }

  deletePhoto() {
    this.fileRef
      .delete()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        () => {
          this.snack.open(
            this.i18n.nativeElement.childNodes[2].textContent,
            'X',
            { duration: 3000 }
          );
          this.photoUrl = '';
          this.downloadUrl = '';
          this.end.emit(this.photoUrl);
        },
        () =>
          this.snack.open(
            this.i18n.nativeElement.childNodes[3].textContent,
            'X',
            { duration: 3000 }
          )
      );
  }

  cancelUpload() {
    if (this.task.cancel()) {
      this.isPaused = false;
      this.photoUrl = '';
    }
  }

  ngOnDestroy() {
    if (this.deleteOnClose && this.photoUrl) {
      this.fileRef
        .delete()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe();
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
