import { createClient } from '@supabase/supabase-js'
import RNFS from 'react-native-fs'
import 'react-native-url-polyfill/auto'

export const uploadImage = async (bucket, pathFile) => {
  console.log({ bucket })
  const supabase = createClient('https://dfegeevgzdtcboiljhon.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmZWdlZXZnemR0Y2JvaWxqaG9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODkyMTY2OTUsImV4cCI6MjAwNDc5MjY5NX0.9ybnKinQxRU_Q_ziKefEl_U6r7cnZIRjVxclu5A5XHU', {
    auth: {
      persistSession: false
    }
  })
  try {
    const file = await RNFS.readFile(`file://${pathFile}`, 'base64')

    const fileName = pathFile.split("/").pop();
    console.log({ fileName })
    const response = await supabase.storage.from(bucket).upload(fileName, file, {
      contentType: 'image/png'
    })
    console.log({ response })
    return response
  } catch (error) {
    console.log('Error reading file:', error);
  }
}

const readPNGFile = async (pathFile) => {

  try {
    const response = await fetch(`file://${pathFile}`);
    const data = await response.blob();

    // Use the data as needed
    return { data }
  } catch (error) {
    // Handle any errors that occur during file reading
    return { error }
  }
};