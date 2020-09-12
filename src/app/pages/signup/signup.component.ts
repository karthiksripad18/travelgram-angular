import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFireDatabase } from '@angular/fire/database';
import { readAndCompressImage } from 'browser-image-resizer';

import { AuthService } from '../../services/auth.service';
import { imageConfig } from 'src/utils/config';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  picture: string =
    'https://learnyst.s3.ammazonaws.com/assets/schools/2410/resources/images/logo_lco_i3oab.png';

  uploadPercent: number = null;
  constructor(
    private auth: AuthService,
    private router: Router,
    private db: AngularFireDatabase,
    private storage: AngularFireStorage,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {}

  onSubmit(f: NgForm) {
    const { email, password, username, country, bio, name } = f.form.value;

    this.auth
      .signUp(email, password) // Service is called which returns an "Observable like object"
      .then((res) => {
        // "then" is like subscribe
        console.log(res); // We can use multiple "then"s --> After one "then's" callback function completes only the other then is called
        const { uid } = res.user;
        this.db.object(`/users/${uid}`).set({
          id: uid,
          name: name,
          email: email,
          instaUserName: username,
          country: country,
          bio: bio,
          picture: this.picture,
        });
      })
      .then(() => {
        this.router.navigateByUrl('/');
        this.toastr.success('SignUp Success');
      })
      .catch((err) => {
        this.toastr.error(err.message, '', { closeButton: true });
      });
  }

  // We are using an "async" method since we are uploading an image
  async uploadFile(event) {
    console.log('Event Target', event.target);
    const file = event.target.files[0];
    let resizedImage = await readAndCompressImage(file, imageConfig);
    const filePath = file.name; // rename the image with TODO: UUID
    const fileRef = this.storage.ref(filePath);

    const task = this.storage.upload(filePath, resizedImage);

    task.percentageChanges().subscribe((percentage) => {
      this.uploadPercent = percentage;
    });

    // When the task is done, we can look for changes that are happening
    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          // Now file is uploaded
          fileRef.getDownloadURL().subscribe((url) => {
            this.picture = url;
            this.toastr.success('Image uploaded Successfully');
          });
        })
      )
      .subscribe();
  }
}
