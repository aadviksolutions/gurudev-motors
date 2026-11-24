import { prisma } from '@/lib/prisma';

export async function getNextJobCardSerial(): Promise<string> {
  // 1. Fetch sequence config
  const config = await prisma.websiteContent.findUnique({
    where: { sectionKey: 'service_job_card_config' },
  });

  let configuredStart = 0;
  if (config && config.metadata) {
    try {
      const parsed = JSON.parse(config.metadata);
      if (parsed.startSerial && !isNaN(Number(parsed.startSerial))) {
        configuredStart = Number(parsed.startSerial);
      }
    } catch {
      configuredStart = 0;
    }
  }

  // 2. Fetch all existing numeric jobCardNumbers
  const existingJobCards = await prisma.serviceJobCard.findMany({
    select: { jobCardNumber: true },
  });

  let maxNumeric = 819; // Default base before first Gurudev Motors pad 0820
  for (const jc of existingJobCards) {
    const raw = (jc.jobCardNumber || '').trim();
    const num = parseInt(raw, 10);
    if (!isNaN(num) && String(num) === raw.replace(/^0+/, '')) {
      if (num > maxNumeric) {
        maxNumeric = num;
      }
    }
  }

  let nextNum = configuredStart > maxNumeric ? configuredStart : maxNumeric + 1;

  // Verify uniqueness (in case of conflict, increment until unique)
  while (existingJobCards.some((jc) => jc.jobCardNumber === String(nextNum).padStart(4, '0'))) {
    nextNum++;
  }

  return String(nextNum).padStart(4, '0');
}
