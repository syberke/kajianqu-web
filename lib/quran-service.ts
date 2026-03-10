export const QuranService = {

  async getSurahs(){
    const res = await fetch("https://api.alquran.cloud/v1/surah")
    const data = await res.json()
    return data.data
  },

  async getSurahDetail(id:number){
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${id}/editions/quran-uthmani,id.indonesian`)
    const data = await res.json()

    const arab = data.data[0].ayahs
    const indo = data.data[1].ayahs

    return arab.map((a:any,i:number)=>({
      number: a.number,
      text: a.text,
      translation: indo[i].text
    }))
  },

  async getJuz(id:number){
    const res = await fetch(`https://api.alquran.cloud/v1/juz/${id}/quran-uthmani`)
    const data = await res.json()
    return data.data.ayahs
  }

}