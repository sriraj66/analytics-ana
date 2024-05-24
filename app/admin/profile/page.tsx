'use client';
import { useCookies } from 'react-cookie';
import styles2 from '../page.module.css'
import styles from './page.module.css'
import request from '@/utils/customFetch';
import { ChangeEvent, FormEvent } from 'react';
import Cropper from 'react-easy-crop'
import getCroppedImg from '@/utils/cropImage';
import { useState, useRef, useEffect } from 'react'
import imageCompression from 'browser-image-compression';
import { Space_Grotesk, Rubik, Nunito, Poppins } from 'next/font/google'
import Spinner from '@/components/misc/loaders/spinner';

const nunito = Nunito({ weight: ['300', '400', '500', '700'], subsets: ['latin'] })
const rubik = Rubik({ weight: ['300', '400', '500', '700'], subsets: ['latin'] })
const poppins = Poppins({ weight: ['300', '400', '500', '700'], subsets: ['latin'] })
const space_grotesk = Space_Grotesk({ weight: ['400', '500', '600', '700'], subsets: ['latin'] })

export default function StudentProfile() {
  const [cookie, setCookie, getCookie] = useCookies()
  const [profileSettings, setProfileSettings] = useState(Object())
  const [fetchingData, setFetchingData] = useState(true)
  const [currentUser, setCurrentUser] = useState('')
  const [userAvatar, setUserAvatar] = useState<string | null>(null)

  const [profileSavingState, setProfileSavingState] = useState(false)
  const [passwordUpdatingState, setPasswordUpdatingState] = useState(false)
  const [avatarUpdatingState, setAvatarUpdatingState] = useState(false)

  const profilePopup = useRef<HTMLDivElement | null>(null)
  const fileInput = useRef<HTMLInputElement | null>(null)
  const [profileImg, setProfileImg] = useState<any>(null)
  const [profileImgURL, setProfileImgURL] = useState<string | null>(null);

  const [passStatus, setPassStatus] = useState(Object({ error: false, text: '' }))
  const [newPass, setNewPass] = useState('')
  const [newRePass, setNewRePass] = useState('')

  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  async function profileFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget;
    let formDataObject: any = Object.fromEntries(new FormData(form).entries());
    setProfileSavingState(true)
    try {
      await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/admin/settings/personal`, {method: 'POST', body: JSON.stringify(formDataObject), cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
    } catch {
      console.error('Error Saving Profile data');
    }
    setProfileSavingState(false)
  }

  async function passwordFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPassStatus({...passStatus, text: ''})
    const form = event.currentTarget;
    let formDataObject: any = Object.fromEntries(new FormData(form).entries());
    if (formDataObject.password !== formDataObject.re_password) {
      setPassStatus({...passStatus, error: true, text: 'Passwords doesnt Match'})
      setPasswordUpdatingState(false);
      return
    };
    setPasswordUpdatingState(true)
    try {
      const response = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/admin/settings/security`, {method: 'POST', body: JSON.stringify(formDataObject), cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
      const data = await response.json()
      setPassStatus({...passStatus, error: (data?.status !== 'Updated'), text: (data.status === 'Updated') ? 'Password Updated' : data.status })
    } catch {
      console.error('Error Saving Profile data');
    }
    setPasswordUpdatingState(false)
  }

  async function handleImgChange(event: ChangeEvent<HTMLInputElement>) {
    const ImgFile: any = event.target.files?.[0];
    const options = {
      maxSizeMB: 0.1,
      maxWidthOrHeight: 640,
      useWebWorker: true
    }
    const imgReader = new FileReader();
    imgReader.onload = function (e: any) {
      const base64String = e.target.result;
      setProfileImgURL(base64String);
      setProfileImg(base64String)
    };
    if (ImgFile) {
      imgReader.readAsDataURL(ImgFile)
      imgReader.readAsDataURL(await imageCompression(ImgFile, options));
    }
  }

  const onCropComplete = async (croppedArea: any, croppedAreaPixels: any) => {
    if (profileImgURL === null) return;
    const options = {
      maxSizeMB: 0.1,
      maxWidthOrHeight: 640,
      useWebWorker: true
    }
    setCroppedAreaPixels(croppedAreaPixels)
    try {
      const croppedImage = await getCroppedImg(
        profileImgURL,
        croppedAreaPixels,
        rotation
      )
      const imgReader = new FileReader();
      imgReader.onload = function (e: any) {
        const base64String = e.target.result;
        setProfileImg(base64String);
      };
      imgReader.readAsDataURL(croppedImage);
    } catch {
      console.error('Error While Cropping the Image')
    }
  }

  async function uploadImage(event: any) {
    event.preventDefault()
    setAvatarUpdatingState(true)
    try {
      await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/admin/settings/personal`, {method: 'POST', body: JSON.stringify({ imageData: profileImg }), cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
      setAvatarUpdatingState(false)
    } catch {
      console.error('Error Saving Profile data');
      setAvatarUpdatingState(false)
      return
    }
    localStorage.removeItem('userAvatar')
    try {
      try {
        localStorage.setItem('userAvatar', profileImg)
      } catch {}
      setAvatarUpdatingState(false)
    } catch {
      console.error('Local Storage Error')
    }
    document.location.reload()
  }

  async function deleteAvatar(event: any) {
    localStorage.removeItem('userAvatar')
    await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/admin/settings/personal`, {method: 'POST', body: JSON.stringify({ imageData: '' }), cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
    document.location.reload()
  }

  useEffect(() => {
    const fetchDatas = async () => {
      try {
        const response = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/admin/settings`, {method: 'GET', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
        const profile_data = await response.json();
        setProfileSettings((profile_data === undefined) ? {} : profile_data)
        setFetchingData(false)
      } catch {
        console.error('Error fetching data');
        setFetchingData(false)
      }
    }
    if (fetchingData) {
      fetchDatas();
    }
  }, [profileSettings])

  useEffect(() => {
    async function loadMeta() {
      setCurrentUser(cookie.currentUser)
      const userImageResp = await request(`${process.env.NEXT_PUBLIC_BACKEND_IP}/student/settings/${cookie.currentId}/image`, {method: 'GET', cache: 'no-cache', headers: {'Authorization': `Bearer ${cookie.token}`, 'Content-Type': 'application/json', 'Accept': 'application/json'}})
      const userImageData = await userImageResp.json()
      if (userImageData.image !== undefined) {
        setUserAvatar(userImageData.image)
        if ((localStorage.getItem('userAvatar') === null) || (userImageData.image !== localStorage.getItem('userAvatar'))) {
          try {
            localStorage.setItem('userAvatar', userImageData.image)
          } catch {}
        }
      }
    }
    loadMeta();
  }, [])

  return (
    <div className={[styles2.dashboard_main_contents, styles.dashboard_main_contents].join(' ')}>
      <div className={[styles.white_div, styles2.light_white_div].join(' ')}>
        <div className={styles2.table_decoration}>
          <span style={{ fontSize: '24.5px', fontWeight: '500', borderBottom: '2px solid #1b238d' }} className={[styles2.heading_text, poppins.className].join(' ')}>
            Profile
          </span>
          <div className={styles.profile_main_div}>
            <div className={styles.profile_icon_main_div}>
              <div className={[styles.profile_text, rubik.className].join(' ')}>
                {((userAvatar === null) || (userAvatar === '')) ? currentUser.split(' ').slice(0, 2).map((a) => a[0]).join('') : ''}
              </div>
              <div className={[styles.profile_icon_box].join(' ')}>
                <button onClick={(event) => {if (profilePopup.current !== null) { profilePopup.current.style.display = 'flex' }}} style={{ backgroundColor: '#282b4a', borderColor: '#282b4a', color: 'white' }} className={poppins.className}>
                  Change Picture
                </button>
                <button onClick={deleteAvatar} className={poppins.className}>
                  Delete Picture
                </button>
              </div>
            </div>
            <form onSubmit={profileFormSubmit} className={styles.profile_settings_main_div}>
              <div className={[styles.profile_input_div, poppins.className].join(' ')}>
                <span>Name</span>
                <input defaultValue={(profileSettings.name === undefined) ? '' : profileSettings.name} name='name' type='text' placeholder='Enter your Name' className={poppins.className}></input>
              </div>
              <div className={[styles.profile_input_div, poppins.className].join(' ')}>
                <span>Email</span>
                <input defaultValue={(profileSettings.email === undefined) ? '' : profileSettings.email} name='email' type='email' placeholder='Enter the Mail ID' className={poppins.className}></input>
              </div>
              <button disabled={profileSavingState} style={profileSavingState ? { cursor: 'no-drop', color: 'white', backgroundColor: '#282b4a' } : {}} className={[poppins.className].join(' ')} type='submit'>
                <span>Save</span>
                {profileSavingState &&
                  <Spinner />
                }
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className={[styles.white_div, styles2.light_white_div].join(' ')}>
        <div className={styles2.table_decoration}>
          <span style={{ fontSize: '21.5px', fontWeight: '500', borderBottom: '2px solid #1b238d' }} className={[styles2.heading_text, poppins.className].join(' ')}>
            Change Password
          </span>
          <div className={styles.profile_main_div}>
            <form onSubmit={passwordFormSubmit} className={styles.profile_settings_main_div}>
              <div className={[styles.profile_input_div, poppins.className].join(' ')}>
                <span>Current Password</span>
                <input name='oldpassword' type='text' placeholder='Enter your Current Password' className={poppins.className} required />
              </div>
              <div className={[styles.profile_input_div, poppins.className].join(' ')}>
                <span>New Password</span>
                <input onChange={(event) => setNewPass(event.currentTarget.value)} style={{boxShadow : ((newPass) === '') ? 'rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgb(209, 213, 219) 0px 0px 0px 1px inset' : '#1b8c06 0px 0px 0px 1.5px'}} name='password' type='text' placeholder='Enter your New Password' className={poppins.className} required />
              </div>
              <div className={[styles.profile_input_div, poppins.className].join(' ')}>
                <span>Retype Password</span>
                <input onChange={(event) => setNewRePass(event.currentTarget.value)} style={{boxShadow : (newPass === '') ? 'rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgb(209, 213, 219) 0px 0px 0px 1px inset' : ((newRePass) === newPass) ? '#1b8c06 0px 0px 0px 1.5px' : '#DC3545 0px 0px 0px 1.5px'}} name='re_password' type='text' placeholder='Re-Enter your New Password' className={poppins.className} required />
              </div>
              {(passStatus.text !== '') &&
                <span style={{ color: (passStatus.error ? '#DC3545' : '#28a745') }} className={[styles.profile_settings, poppins.className].join(' ')}>
                  {passStatus.text}
                </span>
              }
              <button disabled={passwordUpdatingState} style={passwordUpdatingState ? { cursor: 'no-drop', color: 'white', backgroundColor: '#282b4a' } : {}} className={[poppins.className].join(' ')} type='submit'>
                <span>Update</span>
                {passwordUpdatingState &&
                  <Spinner />
                }
              </button>
            </form>
          </div>
        </div>
      </div>
      <div ref={profilePopup} className={styles.profile_popup}>
        <div className={styles.profile_popup_inner_div}>
          <div className={[styles.profile_popup_header, rubik.className].join(' ')}>
            <span>Change Profile</span>
            <span onClick={(event) => {if (profilePopup.current !== null) { profilePopup.current.style.display = 'none' }}} className={styles.profile_popup_div_close}>&times;</span>
          </div>
          <div style={{ borderRadius: 0, padding: '20px 30px' }} className={[styles.white_div, styles2.light_white_div].join(' ')}>
            <div className={styles2.table_decoration}>
              <form onSubmit={uploadImage} className={styles.profile_icon_form_div}>
                <div className={styles.image_cropper_div}>
                  <input name='image' accept='image/png, image/jpg, image/jpeg' required onChange={handleImgChange} style={{ display: 'none' }} ref={fileInput} type='file' />
                  {(profileImgURL === null) ?
                    <span className={[styles.profile_banner_img, nunito.className].join(' ')}>
                      Upload the Profile Image
                    </span>
                    :
                    <Cropper
                      image={profileImgURL}
                      crop={crop}
                      rotation={rotation}
                      zoom={zoom}
                      aspect={1}
                      cropShape="round"
                      showGrid={false}
                      onCropChange={setCrop}
                      onRotationChange={setRotation}
                      onCropComplete={onCropComplete}
                      onZoomChange={setZoom}
                    />
                  }
                </div>
                <div className={[styles.profile_icon_form_buttons_div, rubik.className].join(' ')}>
                  <button style={{ backgroundColor: 'rgb(18, 112, 223)' }} className={[styles.profile_icon_form_button, rubik.className].join(' ')} type='button' onClick={() => {(fileInput.current !== null) && fileInput.current.click()}}>
                    Select Image
                  </button>
                  <button disabled={avatarUpdatingState} style={avatarUpdatingState ? { cursor: 'no-drop', backgroundColor: '#3cb371' } : { backgroundColor: '#3cb371' }} className={[styles.profile_icon_form_button, rubik.className, poppins.className].join(' ')} type='submit'>
                    <span>Upload</span>
                    {avatarUpdatingState &&
                      <Spinner />
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
