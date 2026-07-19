import os
import json
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

# 1. FastAPI App Initialization
app = FastAPI(title="Nightingale Neighborhood Intelligence API")

# 2. CORS Configuration (Allow Frontend running on port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Initialize Google GenAI client (Server-Side)
# The API key is loaded from the environment
api_key = os.environ.get("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

# 4. In-Memory Chat Sessions Dictionary
# Maps session_id to active google.genai chat session objects
chat_sessions: Dict[str, Any] = {}

# 5. Pydantic Models for Strict Contracts
class NeighborhoodSummaryResponse(BaseModel):
    neighborhood_id: str = Field(..., description="The unique identifier of the neighborhood")
    summary: str = Field(..., description="Turkish summary text analyzing reviews and features")
    positive_tags: List[str] = Field(..., description="List of positive semantic tags/hashtags")
    negative_tags: List[str] = Field(..., description="List of negative semantic tags/hashtags")
    life_score: int = Field(..., description="Dynamic general quality of life score from 0 to 100")

class ChatRequest(BaseModel):
    session_id: str
    message: str

class ChatResponse(BaseModel):
    reply: str

# 6. Helper: Load Local Mock Data
def load_mock_data() -> List[Dict[str, Any]]:
    # Tries to find mock_neighborhoods.json in parent or current folder
    paths_to_try = ["mock_neighborhoods.json", "../mock_neighborhoods.json", "backend/mock_neighborhoods.json"]
    for p in paths_to_try:
        if os.path.exists(p):
            with open(p, "r", encoding="utf-8") as f:
                return json.load(f)
    # Fallback default empty list if file not found
    return []

def get_neighborhood_by_id(neighborhood_id: str) -> Dict[str, Any]:
    data = load_mock_data()
    for item in data:
        if item["id"] == neighborhood_id:
            return item
    raise HTTPException(status_code=404, detail="Neighborhood not found in mock database")

# 7. Endpoint 1: GET /neighborhoods/{id}/summary
@app.get("/neighborhoods/{neighborhood_id}/summary", response_model=NeighborhoodSummaryResponse)
async def get_summary(neighborhood_id: str):
    # Fetch local reviews and attributes
    neighborhood = get_neighborhood_by_id(neighborhood_id)
    reviews_text = json.dumps(neighborhood["reviews"], ensure_ascii=False, indent=2)
    metrics_text = json.dumps(neighborhood["metrics"], ensure_ascii=False, indent=2)
    
    # Prompt for Gemini 3.5 Flash
    prompt = f"""
    Sen Nightingale (OURNB) platformunun mahalle analizi yapan yapay zeka uzmanısın.
    Aşağıda bilgileri ve kullanıcı yorumları verilen '{neighborhood['name']}' ({neighborhood['city']}, {neighborhood['district']}) mahallesini analiz et.
    
    [Mahalle Verileri]
    Şehir: {neighborhood['city']}
    İlçe: {neighborhood['district']}
    Ortalama Yaşam Kalitesi Puanı: {neighborhood['life_score']} / 100
    Kriter Puanları (Ulaşım, Sosyal Hayat, Yeşil Alan, Sessizlik): {metrics_text}
    
    [Gerçek Kullanıcı Yorumları]
    {reviews_text}
    
    Lütfen bu verileri sentezleyerek Türkçe bir özet hazırla. Özet, mahallenin sosyal, lojistik ve çevresel karakterini, ulaşım kolaylıklarını, internet ve altyapı durumunu, sessizlik düzeyini ve kimler için uygun olduğunu tarafsız ve samimi bir dille açıklamalıdır.
    Ayrıca mahallenin öne çıkan en önemli 2-3 olumlu özelliğini (positive_tags) ve en önemli 1-2 olumsuz özelliğini veya kısıtını (negative_tags) hashtag formatında oluştur (Örn: #SahilYurumeMesafesi, #HaftasonuOtoparkSorunu).
    Yaşam kalitesi puanını (life_score) mahalle verilerine ve yorumlara dayanarak 0-100 arası bir tamsayı olarak belirle veya güncelle.
    """

    try:
        # Call gemini-3.5-flash with structured output using response_schema
        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=NeighborhoodSummaryResponse,
                system_instruction="Sen Nightingale platformu için Türkçe mahalle analitiği ve LLM semantik özet üreticisisin. Yanıtların her zaman Pydantic şeması ile tam uyumlu geçerli JSON olmalıdır."
            )
        )
        
        # Parse output
        result_json = json.loads(response.text)
        return NeighborhoodSummaryResponse(**result_json)
    except Exception as e:
        print(f"Gemini API Error: {e}")
        # Return fallback structured response if API fails
        return NeighborhoodSummaryResponse(
            neighborhood_id=neighborhood_id,
            summary=f"{neighborhood['name']} mahallesi, {neighborhood['city']} ilimizin {neighborhood['district']} ilçesinde yer alan, yaşam kalitesi {neighborhood['life_score']}/100 olan popüler bir semttir.",
            positive_tags=["#KullanisliUlasim", "#SosyalKultur"],
            negative_tags=["#GelisimIhtiyaci"],
            life_score=neighborhood["life_score"]
        )

# 8. Endpoint 2: POST /neighborhoods/{id}/chat
@app.get("/neighborhoods")
async def list_neighborhoods():
    return load_mock_data()

@app.post("/neighborhoods/{neighborhood_id}/chat", response_model=ChatResponse)
async def chat_with_assistant(neighborhood_id: str, request: ChatRequest):
    neighborhood = get_neighborhood_by_id(neighborhood_id)
    reviews_text = json.dumps(neighborhood["reviews"], ensure_ascii=False, indent=2)
    metrics_text = json.dumps(neighborhood["metrics"], ensure_ascii=False, indent=2)
    
    session_id = request.session_id
    user_message = request.message

    # Custom System Instructions emphasizing the 10 Synthetic User Personas
    system_instruction = f"""
    Sen Nightingale (OURNB) platformunun "AI Neighborhood Assistant" (Yapay Zeka Mahalle Danışmanı) modülüsün.
    Şu anda kullanıcı seninle '{neighborhood['name']}' ({neighborhood['city']}, {neighborhood['district']}) mahallesi hakkında sohbet ediyor.
    
    Mahalle Bilgileri:
    - Şehir/İlçe: {neighborhood['city']}, {neighborhood['district']}
    - Yaşam Kalitesi Skoru: {neighborhood['life_score']}/100
    - Metrik Puanlar (Ulaşım: {neighborhood['metrics']['transportation']}, Sosyal Hayat: {neighborhood['metrics']['social']}, Yeşil Alan Oranı: {neighborhood['metrics']['green_ratio']}, Sessizlik/Ses Seviyesi: {neighborhood['metrics']['quietness']})
    - Gerçek Kullanıcı Yorumları: {reviews_text}
    
    Senin görevin, kullanıcının yaşam tarzı tercihlerine (uzaktan çalışan, öğrenci, evcil hayvan sahibi, aile, aktif emekli vb.) ve sorularına göre mahalleyi değerlendirmektir.
    Sohbet sırasında şu 10 Yapay Zeka Sentetik Kullanıcı Personasının öncelik ve kriterlerini çok iyi bilmeli ve kullanıcının bu gruplardan birine ait olabileceğini unutmamalısın:
    1. PER_001 (The Distant Migrant): İş yerine ulaşım, fiber internet, üçüncü nesil kahveciler.
    2. PER_002 (Digital Nomad): Akustik sessizlik, çalışma dostu kafeler, altyapı stabilitesi.
    3. PER_003 (Conscious Family): Mahalle güvenliği, yeşil alanlar, okul kalitesi.
    4. PER_004 (Active Retiree): Sağlık hizmetlerine erişim, düz ayak sokaklar, yaya güvenliği.
    5. PER_005 (Young Graduate): Düşük yaşam maliyeti/kira, toplu taşıma, aktif gece hayatı.
    6. PER_006 (Pet Owner): Köpek parkları, evcil hayvan dostu kafeler, veteriner yoğunluğu.
    7. PER_007 (Fitness Enthusiast): Koşu/bisiklet parkurları, spor salonları, sağlıklı gıda erişimi.
    8. PER_008 (Creative Professional): Kültürel zenginlik, tarihi doku, sanat galerileri.
    9. PER_009 (Expat): Çok dilli topluluk, uluslararası okul hatları, yüksek güvenlik.
    10. PER_010 (Startup Founder): Teknopark yakınlığı, network etkinlikleri, yüksek hızlı simetrik fiber internet.
    
    Kullanıcı sana kendisini tanıtırsa veya sorular sorarsa, bu persona öncelikleri ve gerçek yorumlarla ilişkilendirerek samimi, dürüst ve yol gösterici yanıtlar ver. Türkçe konuş.
    Sadece gerçekçi yorumlardan ve mahalle puanlarından çıkarımlar yap, olmayan fantastik özellikleri uydurma.
    """

    try:
        # If no active chat session exists for this session_id, create it using client.chats.create
        if session_id not in chat_sessions:
            chat_sessions[session_id] = client.chats.create(
                model="gemini-3.5-flash",
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.7,
                )
            )
        
        # Send message to stateful chat object
        chat_obj = chat_sessions[session_id]
        response = chat_obj.send_message(message=user_message)
        
        return ChatResponse(reply=response.text)
    except Exception as e:
        print(f"FastAPI Chat Error: {e}")
        raise HTTPException(status_code=500, detail=f"AI Chat error: {str(e)}")

# 9. Main Block for Direct Testing
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
